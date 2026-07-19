# 3. SQL-Level Prefixed IDs

**Status:** Accepted

## Context

We want human-readable prefixed IDs (e.g., `cus_550e8400e29b...`, `ord_...`). Two approaches were considered:

**App-level utility:** A `generateEntityId("cus")` function called before insert. Medusa uses this approach. The risk is dual source of truth — the prefix appears in both the model definition (as documentation or validation) and the utility call site. If they diverge, IDs get the wrong prefix silently.

**SQL-level default:** The column default uses `CONCAT('cus_', REPLACE(gen_random_uuid()::text, '-', ''))`. The prefix is defined once in the model and Postgres generates the ID on INSERT.

## Decision

IDs are generated at the SQL level via the column default. The prefix lives in exactly one place — the Drizzle model definition:

```typescript
id: text('id').primaryKey().default(
  sql`CONCAT('cus_', REPLACE(gen_random_uuid()::text, '-', ''))`
)
```

Repositories use `.returning()` after INSERT to get the generated ID.

## Consequences

- Single source of truth for the prefix — impossible to mismatch
- No app-level utility to maintain or import
- Works correctly even if rows are inserted outside the application (migrations, scripts, SQL console)
- Requires `.returning()` on every INSERT to get the ID back (standard Drizzle pattern)
- When creating parent + children in one transaction, parent must be inserted first to get its ID
- `gen_random_uuid()` is built into Postgres 13+ — no extension needed
