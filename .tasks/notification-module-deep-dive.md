# Notification Module Deep Dive

> Research date: 2026-08-07

## Architecture Overview

The notification module is a channel-agnostic dispatch system that sits between domain events (or workflows) and external delivery providers (SendGrid, custom SMS, etc.). It stores every notification attempt in the database with status tracking, supports idempotency, and routes messages to the correct provider based on the `channel` field.

```
┌─────────────────────────────────────┐
│        Trigger Sources              │
│                                     │
│  Event Subscriber          Workflow │
│  (order.created)      (export jobs) │
└──────────┬──────────────────┬───────┘
           │                  │
           ▼                  ▼
┌─────────────────────────────────────┐
│   NotificationModuleService         │
│   createNotifications()             │
│                                     │
│   1. Idempotency check              │
│   2. Resolve provider by channel    │
│   3. Create PENDING DB record       │
│   4. Dispatch to provider           │
│   5. Update status → SUCCESS/FAILURE│
└──────────────────┬──────────────────┘
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
  SendGrid      Local        Cloud Email
  Provider      Provider     Provider
  (email)       (log only)   (Medusa Cloud)
```

## Module Registration

```
packages/modules/notification/src/index.ts
```

```typescript
Module(Modules.NOTIFICATION, {
  service: NotificationModuleService,
  loaders: [loadProviders],
})
```

The module registers `NotificationModuleService` as its service and runs a single loader (`loadProviders`) at startup to register and sync providers.

## Data Models

### Notification

```
packages/modules/notification/src/models/notification.ts
```

| Field | Type | Notes |
|---|---|---|
| `id` | `noti_*` | Primary key |
| `to` | text (searchable) | Email, phone, username depending on channel |
| `from` | text (nullable) | Sender address |
| `channel` | text | `"email"`, `"sms"`, `"feed"`, etc. |
| `template` | text (nullable) | Template ID in the provider's system |
| `data` | json (nullable) | Template variables for rendering |
| `provider_data` | json (nullable) | Channel-specific extras (e.g., cc/bcc) |
| `trigger_type` | text (nullable) | What triggered it (event name, workflow, etc.) |
| `resource_id` | text (searchable, nullable) | Related entity ID (e.g., order ID) |
| `resource_type` | text (nullable) | Related entity type (e.g., `"order"`) |
| `receiver_id` | text (indexed, nullable) | Customer/user receiving it |
| `original_notification_id` | text (nullable) | For retry tracking |
| `idempotency_key` | text (unique, nullable) | Prevents duplicate sends |
| `external_id` | text (nullable) | ID from the external provider's response |
| `status` | enum | `PENDING` -> `SUCCESS` or `FAILURE` |
| `provider` | belongsTo | FK to `NotificationProvider` |

A source comment notes that TTL should probably be added for DB bloat and GDPR compliance.

### NotificationProvider

```
packages/modules/notification/src/models/notification-provider.ts
```

| Field | Type | Notes |
|---|---|---|
| `id` | `notpro_*` | Primary key |
| `handle` | text | Provider identifier |
| `name` | text | Human-readable name |
| `is_enabled` | boolean | Default `true`, set `false` when removed from config |
| `channels` | array | List of channels this provider handles (e.g., `["email"]`) |
| `notifications` | hasMany | Relation to Notification records |

## Provider System

### Provider Interface

```
packages/core/types/src/notification/provider.ts
```

Every provider implements a single method:

```typescript
interface INotificationProvider {
  send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO>
}
```

The input DTO includes: `to`, `from`, `channel`, `template`, `data`, `provider_data`, `content`, `attachments`.

The result returns an optional `{ id?: string }` (the external system's ID).

### Abstract Base Class

```
packages/core/utils/src/notification/abstract-notification-provider.ts
```

`AbstractNotificationProviderService` provides:
- A static `identifier` field for registration
- A static `validateOptions()` method for config validation
- A default `send()` that throws "not implemented"

### Built-in Providers

**1. Local Provider**

```
packages/modules/providers/notification-local/src/services/local.ts
```

- `identifier: "notification-local"`
- Logs the notification to the console via `this.logger_.info(message)`
- Returns `{}` (no external ID)
- Useful for development/testing

**2. SendGrid Provider**

```
packages/modules/providers/notification-sendgrid/src/services/sendgrid.ts
```

- `identifier: "notification-sendgrid"`
- Two modes: **template mode** (uses SendGrid dynamic templates via `templateId`) or **content mode** (inline `subject` + `html`)
- Handles `attachments` (base64 content, filename, MIME type)
- Supports SendGrid `personalizations` via `provider_data.personalizations`
- Falls back to `options.from` if `notification.from` is empty

**3. Medusa Cloud Email**

```
packages/modules/notification/src/providers/medusa-cloud-email.ts
```

- `identifier: "notification-medusa-cloud-email"`
- Built into the module itself (not a separate provider package)
- Auto-registered when no other `"email"` channel provider exists and valid cloud options are provided
- POSTs to `${endpoint}/send` with Basic auth and environment/sandbox headers

### Provider Registration and Startup

```
packages/modules/notification/src/loaders/providers.ts
```

On module boot:

1. Each configured provider is registered in the DI container under key `np_<provider_id>` (the `NotificationProviderRegistrationPrefix`)
2. **Cloud email auto-registration**: If no provider claims the `"email"` channel AND valid cloud config exists (`api_key`, `endpoint`, `environment_handle` or `sandbox_handle`), the cloud email provider is auto-registered with id `"cloud"`
3. **DB sync**: All providers are upserted into the `NotificationProvider` table; providers in DB but no longer in config get `is_enabled: false`
4. **Channel validation**: Throws if two providers claim the same channel -- each channel can only have one provider

### Provider Resolution at Runtime

```
packages/modules/notification/src/services/notification-provider.ts
```

`NotificationProviderService.getProviderForChannels()` lazily builds an in-memory `Map<channel, provider>` from the DB (querying only `is_enabled: true` providers). When `send()` is called, it resolves the provider instance from the DI container via `np_<provider.id>` and delegates to its `send()` method.

The cache is never invalidated because providers can only be registered at startup.

## Core Service Logic

### `NotificationModuleService.createNotifications()`

```
packages/modules/notification/src/services/notification-module-service.ts:60-234
```

This is the single entry point for sending notifications. Both the event subscriber and workflow steps call this method.

**1. Idempotency Check** (lines 107-137)
- Extracts all `idempotency_key` values from the batch
- Queries DB for already-sent notifications with those keys
- Skips any notification whose key exists AND status is not `FAILURE`
- Failed notifications with the same key ARE retried
- A TODO comment notes this should use Redis-based locking instead of DB queries

**2. Provider Resolution** (lines 139-161)
- Calls `getProviderForChannels()` with all channels in the batch
- Each notification gets its `provider_id` set

**3. DB Record Creation** (lines 163-178)
- Creates `PENDING` records inside a transaction before the provider is called
- This prevents concurrent requests from double-processing the same notification

**4. Provider Dispatch** (lines 182-217)
- Uses `promiseAll` with `aggregateErrors: true` so all notifications in a batch are attempted
- If provider is missing or disabled: `FAILURE` status + error thrown
- If `providerHandler.send()` throws: `FAILURE` status + error wrapped
- On success: `external_id` captured, `SUCCESS` status

**5. Status Update** (lines 218-231)
- In a `finally` block, all status updates are flushed to DB regardless of errors
- Maintains original insertion order in the returned array

## Module Service Interface

```
packages/core/types/src/notification/service.ts
```

`INotificationModuleService` exposes:

| Method | Description |
|---|---|
| `createNotifications(data[])` | Send multiple notifications and store them |
| `createNotifications(data)` | Send a single notification and store it |
| `retrieveNotification(id, config?)` | Retrieve a notification by ID |
| `listNotifications(filters?, config?)` | Paginated list with filters |
| `listAndCountNotifications(filters?, config?)` | Paginated list with total count |

The `MedusaService` base class also provides inherited CRUD methods for the `Notification` entity.

## Module Options Type

```
packages/modules/notification/src/types/index.ts
```

```typescript
type NotificationModuleOptions = Partial<ModuleServiceInitializeOptions> & {
  providers?: {
    resolve: string | ModuleProviderExports
    id: string
    options?: Record<string, unknown> & { channels: string[] }
  }[]
  cloud?: {
    api_key: string
    endpoint: string
    environment_handle?: string
    sandbox_handle?: string
  }
}
```

Each provider entry requires an `id`, a `resolve` path (or module exports), and `options` that must include which `channels` the provider handles.

## Two Trigger Paths

### Path 1: Event Subscriber

```
packages/medusa/src/subscribers/configurable-notifications.ts
```

A static `handlerConfig` array maps domain events to notification parameters:

```typescript
// Currently configured:
{
  event: "order.created",
  template: "order-created-template",
  channel: "email",
  to: "order.email",            // dot-path into event payload
  data: { order_id: "order.id" },
  resource_id: "order.id",
}
```

When an event fires:
1. The subscriber looks up handlers by event name in a pre-built `configAsMap`
2. Uses `pickValueFromObject(path, payload)` to extract values from the event data via dot-notation (e.g., `"order.email"` extracts `payload.order.email`)
3. Calls `notificationService.createNotifications(notificationData)`
4. Errors per-handler are caught and logged without failing other handlers

This is the mechanism for "send an email when an order is created" type scenarios. The `config.event` is set to `handlerConfig.map((h) => h.event)` so the subscriber auto-registers for all configured events.

### Path 2: Workflow Steps

```
packages/core/core-flows/src/notification/steps/send-notifications.ts
packages/core/core-flows/src/notification/steps/notify-on-failure.ts
```

**`sendNotificationsStep`** -- Sends immediately during workflow execution. Resolves `INotificationModuleService` from the container and calls `createNotifications(data)`. No compensation function (notifications are irreversible).

**`notifyOnFailureStep`** -- The main function is a no-op that stores the notification payload as compensation data via `StepResponse(void 0, data)`. The compensation function (which runs on workflow rollback) actually sends the notification. Place it early in a workflow to get failure notifications when any subsequent step throws.

### Workflows Using Notification Steps

All use `channel: "feed"`, `template: "admin-ui"`, `to: ""` -- targeting the admin dashboard's in-app notification feed rather than external email/SMS.

| Workflow | File | Failure Message | Success Message |
|---|---|---|---|
| `exportProductsWorkflow` | `core-flows/src/product/workflows/export-products.ts` | "Failed to export products" | "Product export completed!" + file download link |
| `exportInventoryItemsWorkflow` | `core-flows/src/inventory/workflows/export-inventory-items.ts` | "Failed to export inventory items" | "Inventory export completed!" + file download link |
| `exportOrdersWorkflow` | `core-flows/src/order/workflows/export-orders.ts` | "Failed to export orders" | "Order export completed!" + file download link |
| `importProductsWorkflow` | `core-flows/src/product/workflows/import-products.ts` | "Failed to import products from file X" | "Product import of file X completed!" |
| `importProductsAsChunksWorkflow` | `core-flows/src/product/workflows/import-products-as-chunks.ts` | "Failed to import products from file X" | "Product import of file X completed!" |

Export workflows include a `file` object in the success notification data (`filename`, `url`, `mimeType: "text/csv"`), resolved via a query step. Import workflows only include a text description with the filename.

## Admin API (Read-Only)

```
packages/medusa/src/api/admin/notifications/route.ts
packages/medusa/src/api/admin/notifications/[id]/route.ts
packages/medusa/src/api/admin/notifications/middlewares.ts
packages/medusa/src/api/admin/notifications/validators.ts
packages/medusa/src/api/admin/notifications/query-config.ts
```

| Endpoint | Method | Description |
|---|---|---|
| `/admin/notifications` | GET | List notifications (filterable by `q`, `id`, `channel`, `to`; default limit 50, sorted `-created_at`) |
| `/admin/notifications/:id` | GET | Retrieve a single notification |

Both require `PolicyOperation.read` on the `"notification"` resource. There are no create/update/delete API routes -- notifications are only created programmatically via the service.

Default fields returned: `id`, `to`, `channel`, `template`, `data`, `trigger_type`, `resource_id`, `resource_type`, `receiver_id`, `created_at`, `updated_at`.

## Key Design Decisions

1. **One provider per channel** -- Enforced at startup via `validateProviders()`. You cannot have two providers both claiming `"email"`. Each channel maps to exactly one provider.

2. **Idempotency with retry** -- Duplicate sends are prevented via `idempotency_key`, but failed notifications with the same key CAN be retried (the idempotency check allows `FAILURE` status records through).

3. **Pending-before-send** -- DB records are created with `PENDING` status inside a transaction before the provider is called. This prevents race conditions with concurrent requests.

4. **No compensation on send** -- Sent notifications cannot be rolled back. The `sendNotificationsStep` deliberately has no compensation function.

5. **Provider caching** -- The channel-to-provider mapping is cached in memory after first lookup since providers can only change at startup.

6. **Cloud email fallback** -- If no email provider is configured, the module auto-registers the Medusa Cloud email provider when valid cloud credentials exist.

7. **DB as audit log** -- Every notification attempt is persisted with its status, making the notification table a complete audit trail.

## Key File Index

| File | Purpose |
|---|---|
| `packages/modules/notification/src/index.ts` | Module registration |
| `packages/modules/notification/src/models/notification.ts` | Notification data model |
| `packages/modules/notification/src/models/notification-provider.ts` | NotificationProvider data model |
| `packages/modules/notification/src/services/notification-module-service.ts` | Core `createNotifications` logic |
| `packages/modules/notification/src/services/notification-provider.ts` | Provider resolution and dispatch |
| `packages/modules/notification/src/loaders/providers.ts` | Startup provider registration and DB sync |
| `packages/modules/notification/src/providers/medusa-cloud-email.ts` | Built-in cloud email provider |
| `packages/modules/notification/src/types/index.ts` | Module options type |
| `packages/core/types/src/notification/common.ts` | DTOs: NotificationDTO, Attachment, NotificationContent |
| `packages/core/types/src/notification/mutations.ts` | CreateNotificationDTO |
| `packages/core/types/src/notification/provider.ts` | INotificationProvider, ProviderSendNotificationDTO |
| `packages/core/types/src/notification/service.ts` | INotificationModuleService interface |
| `packages/core/utils/src/notification/abstract-notification-provider.ts` | AbstractNotificationProviderService base class |
| `packages/modules/providers/notification-local/src/services/local.ts` | Local (logging) provider |
| `packages/modules/providers/notification-sendgrid/src/services/sendgrid.ts` | SendGrid provider |
| `packages/core/core-flows/src/notification/steps/send-notifications.ts` | sendNotificationsStep |
| `packages/core/core-flows/src/notification/steps/notify-on-failure.ts` | notifyOnFailureStep |
| `packages/medusa/src/subscribers/configurable-notifications.ts` | Event-to-notification subscriber |
| `packages/medusa/src/api/admin/notifications/route.ts` | GET /admin/notifications |
| `packages/medusa/src/api/admin/notifications/[id]/route.ts` | GET /admin/notifications/:id |
