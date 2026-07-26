# Supabase Event Subscriber System -- Feasibility Analysis

Can we build Medusa-style transactional event delivery using Supabase primitives?

**TL;DR:** Yes for single-transaction workflows (and it's actually simpler). Possible but requires custom orchestration for multi-step sagas.

See [event-subscriber-system.md](./event-subscriber-system.md) for the Medusa system this is compared against.

---

## Medusa's Three Phases vs Supabase Primitives

| Medusa Phase | What it does | Supabase Primitive |
|---|---|---|
| 1. Accumulate | ORM hooks collect events in a `MessageAggregator` | **Postgres AFTER triggers** fire on row mutations |
| 2. Group | Events staged by `eventGroupId`, not dispatched yet | **pgmq** queue + `SET LOCAL` session variable (scoped to transaction) |
| 3. Release | Success -> dispatch to subscribers; Failure -> discard | **Transaction rollback** (events auto-discard) or explicit staging table |

Supporting pieces:

| Supabase Feature | Role |
|---|---|
| **Database Webhooks** (`pg_net`) | Async HTTP dispatch from trigger to Edge Function |
| **Edge Functions** (Deno) | Serverless subscriber handlers |
| **pgmq** (Queues) | Postgres-native message queue with exactly-once visibility timeout |
| **Realtime Postgres Changes** | WAL-based push to WebSocket clients (UI reactivity only, not for server-side subscribers) |
| **pg_cron** | Scheduled polling of queues |

---

## Phase 1: Accumulation via Postgres Triggers

Instead of ORM lifecycle hooks + decorators (`@InjectManager` -> `@EmitEvents` -> MikroORM `afterCreate`), a single Postgres trigger function detects mutations at the database level:

```sql
create function enqueue_domain_event()
returns trigger language plpgsql as $$
begin
  perform pgmq.send('domain_events', jsonb_build_object(
    'event', TG_TABLE_NAME || '.' || lower(TG_OP),
    'data', case TG_OP
      when 'DELETE' then to_jsonb(OLD)
      else to_jsonb(NEW)
    end,
    'group_id', current_setting('app.event_group_id', true),
    'timestamp', now()
  ));
  return coalesce(NEW, OLD);
end;
$$;

-- Attach to each table that should emit events
create trigger product_events after insert or update or delete
on products for each row execute function enqueue_domain_event();
```

**Advantages over Medusa's approach:**
- Fires regardless of which application path wrote the data (no decorator stack required)
- No context-threading or container proxy needed
- Works even for raw SQL writes, migrations, or external tools

**Gaps:**
- Event naming is `table_name.insert` rather than Medusa's `module.entity.action` format -- need a mapping table or naming convention in the trigger
- No built-in deduplication (Medusa's `MessageAggregator` uses a JSON hash set)
- Soft-delete/restore detection requires explicit column checks in the trigger (Medusa compares `deleted_at` vs `originalEntity.deleted_at`)

---

## Phase 2: Grouping via Transaction Scope

Medusa assigns `context.eventGroupId = ulid()` at workflow start and propagates it through every module call via a container Proxy. Events with a `group_id` are staged, not dispatched.

With Supabase, use Postgres session variables scoped to the transaction:

```sql
-- At the start of a "workflow" transaction
set local app.event_group_id = 'wf_01HX...';

-- All triggers during this transaction will read this value
-- via current_setting('app.event_group_id', true)

-- SET LOCAL auto-clears on COMMIT or ROLLBACK
```

The `pgmq.send()` call inside the trigger happens within the same transaction. If the transaction rolls back, the enqueued message rolls back too. **This gives you Phase 3 (discard on failure) for free.**

---

## Phase 3: Release -- Two Patterns

### Pattern A: Single-transaction workflows (recommended start)

If all operations happen within one Postgres transaction:

```
BEGIN
  SET LOCAL app.event_group_id = 'wf_01HX...';
  INSERT INTO products (...);          -- trigger fires, pgmq.send() within txn
  UPDATE inventory SET ...;            -- trigger fires, pgmq.send() within txn
COMMIT;                                -- messages become visible in pgmq
-- (or ROLLBACK -> messages never existed)
```

No explicit release/discard needed. Transaction commit = release. Transaction rollback = discard. This is stronger than Medusa's in-memory approach because there are no race conditions.

A consumer (pg_cron job or Edge Function) polls the queue and dispatches:

```sql
-- Consumer reads and processes
select * from pgmq.read('domain_events', 30, 10);
-- vt=30: message invisible for 30s (visibility timeout)
-- qty=10: read up to 10 messages

-- After successful processing
select pgmq.delete('domain_events', msg_id);

-- Or archive for audit trail
select pgmq.archive('domain_events', msg_id);
```

### Pattern B: Multi-transaction sagas

When a workflow spans multiple transactions (e.g., call ProductService, then an external payment API, then InventoryService):

1. Events go into a `staged_events` queue with `group_id` in the payload
2. A separate `workflow_groups` table tracks group status:

```sql
create table workflow_groups (
  group_id text primary key,
  status text not null default 'pending', -- pending | completed | failed
  created_at timestamptz default now()
);
```

3. On workflow success: `UPDATE workflow_groups SET status = 'completed' WHERE group_id = ?`
4. Consumer only processes events whose group is `completed`
5. On failure: `UPDATE workflow_groups SET status = 'failed'` and a cleanup job purges those messages

This is more code, but it's the same pattern Medusa implements with `groupedEventsMap_` (local) or `staging:{eventGroupId}` (Redis).

---

## Subscriber Registration and Dispatch

Medusa loads subscriber files at startup and maintains an in-memory `eventToSubscribersMap_`. Supabase has no built-in equivalent.

### Option 1: Database Webhooks (simplest)

For each event type, create a webhook that calls an Edge Function:

```sql
create trigger on_product_created after insert
on products for each row
execute function supabase_functions.http_request(
  'https://<project>.supabase.co/functions/v1/on-product-created',
  'POST',
  '{"Content-Type":"application/json","Authorization":"Bearer <service_role_key>"}',
  '{}',
  '5000'
);
```

Limitation: one trigger per event-handler pair, no dynamic registration.

### Option 2: Subscriber registry table (flexible)

```sql
create table event_subscribers (
  id uuid primary key default gen_random_uuid(),
  event_pattern text not null,         -- 'products.insert' or 'products.*'
  handler_url text not null,           -- Edge Function URL
  subscriber_id text not null unique,  -- stable ID for idempotency
  active boolean default true
);

-- Dispatcher function called by consumer
create function dispatch_event(event_name text, payload jsonb)
returns void language plpgsql as $$
declare
  sub record;
begin
  for sub in
    select * from event_subscribers
    where active
      and (event_pattern = event_name
           or event_name like replace(event_pattern, '*', '%'))
  loop
    perform net.http_post(
      url := sub.handler_url,
      body := jsonb_build_object(
        'event', event_name,
        'data', payload,
        'subscriber_id', sub.subscriber_id
      )
    );
  end loop;
end;
$$;
```

### Option 3: Application-level dispatch

Skip database-level dispatch entirely. Have a Node.js/Deno consumer poll pgmq via the Supabase client, then dispatch to in-process handlers like Medusa does:

```typescript
// poll-events.ts (Edge Function or long-running process)
const events = await supabase.rpc('pgmq_read', {
  queue: 'domain_events', vt: 30, qty: 10
})

for (const msg of events.data) {
  const handlers = subscriberRegistry.get(msg.message.event)
  await Promise.all(handlers.map(h => h(msg.message)))
  await supabase.rpc('pgmq_delete', { queue: 'domain_events', msg_id: msg.msg_id })
}
```

---

## Comparison Summary

| Concern | Medusa | Supabase |
|---|---|---|
| Event detection | ORM hooks + decorator stack + context threading | Postgres triggers (simpler, more reliable) |
| Accumulation | In-memory `MessageAggregator` per context | pgmq messages within transaction |
| Grouping | `eventGroupId` in memory map or Redis staging list | `SET LOCAL` session var (single txn) or staging table (multi txn) |
| Release on success | `releaseGroupedEvents()` | Transaction COMMIT (single txn) or status update (multi txn) |
| Discard on failure | `clearGroupedEvents()` | Transaction ROLLBACK (single txn) or purge job (multi txn) |
| Subscriber registry | File-based loading, in-memory map, HMR support | Manual: webhook config, registry table, or app-level map |
| Retry / exactly-once | BullMQ worker tracks `completedSubscriberIds` | pgmq visibility timeout + `read`/`delete` pattern |
| Event naming | `module.entity.action` (built from code metadata) | `table.operation` (raw) -- needs mapping layer |
| Deduplication | JSON hash set in MessageAggregator | Not built-in -- implement in trigger or consumer |
| Soft-delete detection | Compares `deleted_at` fields automatically | Must check columns explicitly in trigger |

---

## Verdict

### Single-transaction workflows: Supabase is better

Postgres triggers + pgmq + transactional rollback gives you all three phases with less code and stronger guarantees. No in-memory state, no race conditions, no context-threading complexity.

### Multi-step sagas: Buildable but manual

The primitives (pgmq, triggers, Edge Functions, pg_net) are sufficient building blocks. But the grouping/release orchestration -- the part Medusa's workflow engine handles -- becomes custom code. You'd need:
- A `workflow_groups` tracking table
- A consumer that respects group status
- Cleanup jobs for failed/expired groups

### Subscriber management: The biggest gap

Medusa's file-based subscriber loading with HMR, wildcard support, and in-memory registry has no Supabase equivalent. You'd build a `event_subscribers` table or hardcode webhook URLs.

### Realtime Postgres Changes: Not a fit

It pushes to WebSocket clients for UI updates. It doesn't replace server-side event subscribers. Useful alongside the event system (notify the frontend when something changes) but not a substitute for it.

---

## Recommended Starting Point

For this prototype, start with **Pattern A** (single-transaction):

1. Generic `enqueue_domain_event()` trigger function attached to domain tables
2. pgmq `domain_events` queue -- transaction commit = release
3. Application-level consumer (Edge Function on pg_cron or a polling process) with a simple subscriber map
4. Skip multi-transaction grouping until there's a concrete need

This gets 80% of Medusa's event semantics with ~20% of the complexity.

---

## Open Questions

- [ ] pgmq throughput under load -- is polling fast enough, or do we need `pg_notify` to wake consumers?
- [ ] Event naming convention -- `schema.table.operation` or a mapping table for domain-friendly names?
- [ ] Deduplication strategy -- hash in trigger, or idempotent subscribers?
- [ ] Should soft-delete/restore be separate events or just `update` with payload inspection?
- [ ] Edge Functions cold start latency -- acceptable for event processing?
- [ ] How to handle subscriber errors and retries (pgmq visibility timeout vs explicit retry queue)?
