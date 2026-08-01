# @proteus/http-schemas

Zod schemas for HTTP request/response validation and OpenAPI spec generation.

## Directory Structure

```
src/
├── common.ts              # Shared types (IdParams, DeleteResponse, PaginatedResponse, etc.)
├── admin/
│   ├── <domain>/
│   │   ├── entities.ts    # Zod schemas for domain objects
│   │   ├── payloads.ts    # Request body schemas
│   │   ├── queries.ts     # Query param / list filter schemas
│   │   ├── responses.ts   # Response envelope schemas
│   │   └── index.ts       # Re-exports all four
│   └── index.ts
└── store/
    └── <domain>/          # Same structure as admin
```

## Naming Conventions

### Entities

`[Scope][Entity]` — e.g. `AdminProduct`, `StoreCart`, `AdminPaymentSession`

### Response Schemas

| Operation         | Pattern                             | Example                              |
|-------------------|-------------------------------------|--------------------------------------|
| GET list          | `[Scope][Entity]ListResponse`       | `AdminProductListResponse`           |
| GET by id         | `[Scope][Entity]Response`           | `AdminCustomerResponse`              |
| GET with relations| `[Scope][Entity]DetailResponse`     | `AdminFulfillmentSetDetailResponse`  |
| POST create       | `[Scope]Create[Entity]Response`     | `AdminCreateShippingOptionResponse`  |
| POST/PUT update   | `[Scope]Update[Entity]Response`     | `AdminUpdateFulfillmentSetResponse`  |
| DELETE            | `DeleteResponse` (shared)           | `DeleteResponse`                     |
| Webhook           | `WebhookReceivedResponse` (shared)  | `WebhookReceivedResponse`            |

### Payload Schemas

| Operation         | Pattern                             | Example                              |
|-------------------|-------------------------------------|--------------------------------------|
| Create body       | `[Scope]Create[Entity]`             | `AdminCreateProduct`                 |
| Update body       | `[Scope]Update[Entity]`             | `AdminUpdateCustomer`                |
| List query params | `[Scope][Entity]ListParams`         | `AdminCustomerListParams`            |

## Patterns

### Dual export (runtime value + type)

Every schema exports both the zod object (for runtime validation / OpenAPI) and the inferred type:

```ts
export const AdminProduct = z.object({ ... }).openapi('AdminProduct')
export type AdminProduct = z.infer<typeof AdminProduct>
```

### OpenAPI names

Every schema that appears in API responses or request bodies must call `.openapi('SchemaName')` with a unique name matching the export name.

### Datetime fields

Use `z.iso.datetime()` for all timestamp fields (`createdAt`, `updatedAt`, `deletedAt`, etc.).

### Nullable vs optional

- `nullable()` — field is always present but may be `null`
- `optional()` — field may be omitted entirely (use for relation fields that are conditionally loaded)

### Records

Use `z.record(z.string(), z.unknown())` for generic key-value metadata/data fields. This version of zod requires both key and value type arguments.

### Paginated list responses

Extend `PaginatedResponse` from common:

```ts
export const AdminProductListResponse = PaginatedResponse.extend({
  products: z.array(AdminProduct),
}).openapi('AdminProductListResponse')
```

### Shared delete response

All DELETE endpoints use the shared `DeleteResponse` from `common.ts` — don't create per-domain delete schemas.

### Batch endpoints

If the payload accepts an array, the response should return an array too:

```ts
// payload: z.array(AdminCreateCustomer)
// response: { customers: z.array(AdminCustomer) }
```
