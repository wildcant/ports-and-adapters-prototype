# Medusa Event Subscriber System -- Deep Dive

The event system has **three phases**: accumulation, grouping, and release.

```
HTTP Request / Workflow Run
  |
  |-- 1. ACCUMULATION --- MikroORM hooks -> MessageAggregator (per-context)
  |
  |-- 2. GROUPING ------- @EmitEvents decorator flushes -> eventBus.emit()
  |                        Events with eventGroupId are staged, not dispatched
  |
  +-- 3. RELEASE -------- Workflow completes -> releaseGroupedEvents()
                            Success: events dispatched to subscribers
                            Failure: events discarded via clearGroupedEvents()
```

---

## Phase 1: Event Accumulation

When a module service method (e.g., `createProducts`) executes, events are **not emitted immediately**. Instead, they are collected in a `MessageAggregator` attached to the shared context.

### Decorator Stack

Applied in `MedusaService` at `packages/core/utils/src/modules-sdk/medusa-service.ts:156-162`:

```
@InjectManager()     <-- runs first: clones context, provides EntityManager
  @EmitEvents()      <-- runs second: ensures MessageAggregator exists on context
    [method body]    <-- MikroORM persists entities
```

### MikroORM Bridge

**File:** `packages/core/utils/src/modules-sdk/create-medusa-mikro-orm-event-subscriber.ts`

A dynamic MikroORM `EventSubscriber` is created per service. Its `afterCreate`/`afterUpdate`/`afterDelete` hooks call `interceptEntityMutationEvents()`, which:

1. Maps the ORM event to a `CommonEvents` action (`created`, `updated`, `deleted`, `restored`)
2. Detects soft-delete/restore by comparing `deleted_at` vs `originalEntity.deleted_at`
3. Calls `aggregatedEvents()` -> `moduleEventBuilderFactory()` -> `aggregator.saveRawMessageData()`

### Event Name Convention

Built by `buildModuleResourceEventName()` at `packages/core/utils/src/event-bus/utils.ts:49`:

```
{module}.{kebab-case-entity}.{action}
-> "product.product-variant.created"
```

The `MessageAggregator` (`packages/core/utils/src/event-bus/message-aggregator.ts`) deduplicates messages using a JSON hash set.

---

## Phase 2: Grouping via eventGroupId

After the method body returns, `@EmitEvents` flushes the aggregator:

```typescript
// emit-events.ts:40-43
if (aggregator.count() > 0) {
  target.emitEvents_(aggregator.getMessages(options))
}
aggregator.clearMessages()
```

`emitEvents_` (`medusa-service.ts:529-544`) calls `eventBusModuleService_.emit(messages, { internal: true })`.

### The Key Mechanism

When a workflow starts, it assigns `context.eventGroupId = ulid()` (`packages/core/workflows-sdk/src/helper/workflow-export.ts:221`). This ID propagates into every module call via a **container Proxy** (`packages/core/orchestration/src/workflow/local-workflow.ts:96-138`) that auto-injects the workflow's `medusaContext` into `@MedusaContext` parameters.

When the event bus receives events **with** an `eventGroupId`:

- **Local bus**: pushes to `groupedEventsMap_` (in-memory `Map<string, Message[]>`)
- **Redis bus**: `rpush` to `staging:{eventGroupId}` Redis list with configurable TTL (default 600s)

Events **without** `eventGroupId` are emitted immediately (fire-and-forget).

---

## Phase 3: Release on Workflow Completion

`attachOnFinishReleaseEvents` (`packages/core/workflows-sdk/src/helper/workflow-export.ts:590-665`) wraps the transaction's `onFinish` callback:

| Transaction State | Action |
|---|---|
| `DONE` (success) | `eventBusService.releaseGroupedEvents(eventGroupId)` |
| `FAILED` / `REVERTED` | `eventBusService.clearGroupedEvents(eventGroupId)` |
| Sub-workflow (`preventReleaseEvents=true`) | No action -- parent workflow handles release |

This ensures **transactional event semantics**: if a workflow fails and compensates, no events are ever dispatched.

---

## Subscriber Registration

### Subscriber File Contract

**File:** `packages/core/framework/src/subscribers/types.ts`

```typescript
// Must export:
export default async function handler({
  event,
  container,
  pluginOptions,
}: SubscriberArgs) {
  // ...
}

export const config: SubscriberConfig = {
  event: "product.product.created", // string or string[]
  context: { subscriberId: "my-handler" }, // optional
}
```

### Loading Process

**File:** `packages/core/framework/src/subscribers/subscriber-loader.ts`

At startup, `SubscriberLoader` (extends `ResourceLoader`):

1. Scans `packages/medusa/src/subscribers/` + plugin `subscribers/` dirs
2. Filters to `.ts`/`.js` files, excludes tests/index/`_`-prefixed
3. Validates: `default` must be a function, `config.event` must exist
4. For each event string, creates a closure and calls `eventBusService.subscribe(event, subscriber, { subscriberId })`

### Subscriber ID Inference

Priority order (lines 134-160):

1. `config.context.subscriberId` (explicit)
2. Function name (if not anonymous)
3. Kebab-cased filename

The `subscribersLoader` is invoked at `packages/medusa/src/loaders/index.ts:211`, **after** the event bus module is loaded into the container.

---

## Event Bus Implementations

### Local (`packages/modules/event-bus-local/src/services/event-bus-local.ts`)

- Uses a module-level `EventEmitter` singleton with `setMaxListeners(Infinity)`
- `subscribe()` wraps the handler in error-catching closure, registers via `eventEmitter_.on()`
- `emit()` is fire-and-forget (`.then()` not awaited), supports optional `delay` in ms
- Supports wildcard `"*"` listeners
- **Not for production** -- the loader logs a warning

### Redis (`packages/modules/event-bus-redis/src/services/event-bus-redis.ts`)

- Uses BullMQ `Queue` + `Worker` backed by ioredis
- Worker only starts if `isWorkerMode=true` (not in server-only mode)
- `emit()` filters to only events with registered subscribers before enqueueing
- Worker tracks `completedSubscriberIds` across retry attempts -- only failed subscribers re-run
- Internal events get `priority = EventPriority.LOWEST` (2^21) to not block business events

### Abstract Base Class (`packages/core/utils/src/event-bus/index.ts`)

Shared state and logic for both implementations:

- `eventToSubscribersMap_: Map<string | symbol, SubscriberDescriptor[]>` -- the in-memory registry
- `interceptorSubscribers_: Set<InterceptorSubscriber>` -- interceptors that run before every emission
- `subscribe()` -- validates subscriber, assigns ID, stores in map
- `unsubscribe()` -- removes by subscriber ID
- Metadata helpers: `withCreatedAtMetadata`, `withPublishedAtMetadata`, `parseEventMetadataDates`

---

## Interceptors

Both implementations support `addInterceptor(fn)` -- functions called **before** every event emission:

```typescript
// Abstract base: packages/core/utils/src/event-bus/index.ts:170-182
async callInterceptors(message, context) {
  Array.from(this.interceptorSubscribers_).map(async (interceptor) => {
    try {
      await interceptor(message, context)
    } catch (e) {
      logger.error(e) // errors don't stop emission
    }
  })
}
```

Interceptors receive `{ isGrouped: boolean, eventGroupId?: string }` as context.

---

## Core Type Contracts

**File:** `packages/core/types/src/event-bus/common.ts`

| Type | Description |
|---|---|
| `Subscriber<TData>` | `(data: Event<TData>) => Promise<void>` -- handler function shape |
| `SubscriberContext` | `{ subscriberId: string }` -- optional stable ID for a subscriber |
| `EventMetadata` | `Record<string, unknown>` with `eventGroupId?`, `created_at?`, `published_at?` |
| `Event<TData>` | `{ name, metadata?, data }` -- what a subscriber receives |
| `Message<TData>` | `Event<TData> & { options? }` -- what the emitter sends |
| `RawMessageFormat<TData>` | Intermediate builder format before a `Message` is composed |
| `InterceptorSubscriber<T>` | Called before every emission |

**File:** `packages/core/types/src/event-bus/event-bus-module.ts`

`IEventBusModuleService` declares the public contract:

| Method | Purpose |
|---|---|
| `emit(data, options?)` | Emit one or more events |
| `subscribe(eventName, subscriber, context?)` | Register a subscriber |
| `unsubscribe(eventName, subscriber, context?)` | Remove a subscriber |
| `releaseGroupedEvents(eventGroupId)` | Dispatch all staged events for a group |
| `clearGroupedEvents(eventGroupId, options?)` | Discard staged events for a group |
| `addInterceptor?(interceptor)` | Register a pre-emission interceptor |
| `removeInterceptor?(interceptor)` | Remove an interceptor |

---

## HMR (Dev Mode)

**File:** `packages/medusa/src/commands/utils/dev-server/reloaders/subscribers.ts`

`SubscriberReloader` watches for file changes:

- On `change`/`add`: clears Node's module cache, calls `eventBusService.unsubscribe()` for old listeners, re-registers via `SubscriberLoader.createSubscriber()`
- Matches listeners by `subscriberId` on the EventEmitter's listener list

---

## Built-in Subscribers

| Subscriber | File | Events |
|---|---|---|
| Payment webhook | `packages/medusa/src/subscribers/payment-webhook.ts` | `PaymentWebhookEvents.WebhookReceived` |
| Configurable notifications | `packages/medusa/src/subscribers/configurable-notifications.ts` | Multiple order/fulfillment events -> notification templates |

---

## Complete Data Flow (End-to-End)

```
1. HTTP request arrives -> workflow.run() called
   +-- workflow-export.ts:221  context.eventGroupId = ulid()

2. Workflow step executes
   +-- create-step-handler.ts:36  executionContext.eventGroupId set
   +-- local-workflow.ts:104-135  Container Proxy injects medusaContext into module calls

3. Module service method called (e.g., createProducts)
   +-- inject-manager.ts:22      InjectManager runs, copies context, preserves eventGroupId
   +-- emit-events.ts:25          EmitEvents wrapper: calls original method
   +-- inject-into-context.ts:17  Ensures context.messageAggregator = new MessageAggregator()
   +-- [original method body executes, calls internal services]

4. MikroORM lifecycle event fires (e.g., afterCreate)
   +-- create-medusa-mikro-orm-event-subscriber.ts:32  MikroOrmEventSubscriber.afterCreate
   +-- medusa-service.ts:424      interceptEntityMutationEvents: maps to CommonEvents action
   +-- medusa-service.ts:486      aggregatedEvents: calls moduleEventBuilderFactory
   +-- event-builder-factory.ts:39 builder: calls buildModuleResourceEventName
   +-- event-builder-factory.ts:74 aggregator.saveRawMessageData(messages)
   +-- message-aggregator.ts:52   composeMessage: embeds eventGroupId into metadata
   +-- message-aggregator.ts:27   save: stores in #messages (deduplicated)

5. After original method returns, @EmitEvents flushes
   +-- emit-events.ts:40          aggregator.count() > 0 -> getMessages(options)
   +-- emit-events.ts:41          emitEvents_.apply(this, [groupedEvents])
   +-- medusa-service.ts:537      eventBusModuleService_.emit(groupedEvents[group], { internal: true })

6. Event bus receives emit call -- sees eventGroupId in metadata
   +-- Local: event-bus-local.ts:94    groupOrEmitEvent: eventGroupId present -> groupEvent()
                                        groupedEventsMap_.set(eventGroupId, [...events])
   +-- Redis: event-bus-redis.ts:226   eventsToGroup filtered -> groupEvents() -> redis.rpush(staging:{id})

7. Workflow transaction finishes
   +-- workflow-export.ts:601        wrappedOnFinish fires
   +-- workflow-export.ts:637        transaction FAILED/REVERTED -> clearGroupedEvents(id)
   +-- workflow-export.ts:649        transaction SUCCESS -> releaseGroupedEvents(id)

8. releaseGroupedEvents publishes to subscribers
   +-- Local: event-bus-local.ts:140  reads groupedEventsMap_, emits on EventEmitter by name
   +-- Redis: event-bus-redis.ts:312  reads redis list, addBulk to BullMQ queue

9. Subscriber executes
   +-- Local: EventEmitter.on handler -> wrappedSubscriber -> user handler
   +-- Redis: worker_(job) -> subscriber handler({ event, container, pluginOptions })
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `packages/core/types/src/event-bus/common.ts` | `Subscriber`, `Message`, `Event`, `EventMetadata`, `RawMessageFormat` types |
| `packages/core/types/src/event-bus/event-bus-module.ts` | `IEventBusModuleService` interface |
| `packages/core/utils/src/event-bus/index.ts` | `AbstractEventBusModuleService` -- shared base class |
| `packages/core/utils/src/event-bus/message-aggregator.ts` | `MessageAggregator` -- per-context event accumulator |
| `packages/core/utils/src/event-bus/build-event-messages.ts` | `composeMessage` -- `RawMessageFormat` to `Message` |
| `packages/core/utils/src/event-bus/utils.ts` | `buildModuleResourceEventName`, `buildEventNamesFromEntityName`, `EventPriority` |
| `packages/core/utils/src/event-bus/common-events.ts` | `CommonEvents` enum (created/updated/deleted/restored/attached/detached) |
| `packages/core/utils/src/modules-sdk/decorators/emit-events.ts` | `@EmitEvents` decorator |
| `packages/core/utils/src/modules-sdk/decorators/inject-into-context.ts` | `InjectIntoContext` -- context-injecting sub-decorator |
| `packages/core/utils/src/modules-sdk/decorators/inject-manager.ts` | `@InjectManager` -- clones context, provides EntityManager |
| `packages/core/utils/src/modules-sdk/decorators/context-parameter.ts` | `@MedusaContext` -- records context parameter index |
| `packages/core/utils/src/modules-sdk/event-builder-factory.ts` | `moduleEventBuilderFactory` |
| `packages/core/utils/src/modules-sdk/medusa-service.ts` | `MedusaService`, `interceptEntityMutationEvents`, `aggregatedEvents`, `emitEvents_` |
| `packages/core/utils/src/modules-sdk/create-medusa-mikro-orm-event-subscriber.ts` | MikroORM to event bridge |
| `packages/modules/event-bus-local/src/services/event-bus-local.ts` | `LocalEventBusService` -- in-memory Node.js `EventEmitter` impl |
| `packages/modules/event-bus-redis/src/services/event-bus-redis.ts` | `RedisEventBusService` -- BullMQ impl |
| `packages/core/framework/src/subscribers/subscriber-loader.ts` | Loads subscriber files, calls `eventBusService.subscribe` |
| `packages/core/workflows-sdk/src/helper/workflow-export.ts` | `exportWorkflow`, `attachOnFinishReleaseEvents` |
| `packages/core/orchestration/src/workflow/local-workflow.ts` | `LocalWorkflow`: container proxy, `eventGroupId` propagation |
| `packages/core/workflows-sdk/src/utils/composer/helpers/create-step-handler.ts` | `buildStepContext` with `eventGroupId` |
| `packages/medusa/src/loaders/index.ts` | `subscribersLoader` -- startup invocation |

---

## Key Insight

The entire system is designed around **transactional event delivery**: events accumulate during service calls, get staged by `eventGroupId` during workflow execution, and only release to subscribers after the workflow transaction commits successfully. Failed workflows discard their events entirely. This prevents subscribers from acting on data that was rolled back.
