# Middleware, HTTP Schemas & OpenAPI

This guide covers the declarative middleware system, the HTTP schema conventions, and automatic OpenAPI generation.

---

## Overview

Every API directory can have a `middlewares.ts` file that declares validation schemas and OpenAPI metadata for all routes in that subtree. The route loader picks these up at startup to:

1. **Validate** request params, query, and body before the handler runs
2. **Generate** an OpenAPI 3.1 spec from the same schemas
3. **Serve** interactive Swagger UI at `/docs/`

Handlers receive pre-validated data — no manual `validateBody()` calls needed.

---

## HTTP Schemas

Schemas live in `backend/src/core/http-schemas/`, organized by domain following Medusa's naming conventions.

### Directory structure

```
backend/src/core/http-schemas/
├── index.ts              # barrel re-export
├── common.ts             # shared schemas (IdParams, etc.)
└── <domain>/
    ├── index.ts          # re-exports all domain schemas
    ├── entities.ts       # entity shapes (response models)
    ├── payloads.ts       # request body schemas (create/update)
    ├── queries.ts        # query parameter schemas
    └── responses.ts      # response wrapper schemas
```

### Naming conventions

| File | Pattern | Examples |
|------|---------|----------|
| `entities.ts` | `{Entity}` | `Customer` |
| `payloads.ts` | `{Verb}{Entity}` | `CreateCustomer`, `UpdateCustomer` |
| `queries.ts` | `{Entity}Params` / `{Entity}Filters` | `CustomerParams` |
| `responses.ts` | `{Entity}Response` / `{Entity}ListResponse` / `{Entity}DeleteResponse` | `CustomerResponse`, `CustomerListResponse` |
| `common.ts` | Shared utilities | `IdParams` |

### Registering schemas for OpenAPI `$ref`

To avoid inlining the same schema in every endpoint, call `.openapi('Name')` on entity and payload schemas. This registers them in `components/schemas` and all usages become `$ref` references.

```typescript
// entities.ts
import '../../../openapi/setup.js'
import { z } from 'zod'

export const Customer = z
  .object({
    id: z.string(),
    first_name: z.string(),
    // ...
  })
  .openapi('Customer')
```

The `import '../../../openapi/setup.js'` must come before any `.openapi()` call — it extends Zod with the OpenAPI method.

---

## Middleware

### The `middlewares.ts` file

Each API subdirectory (e.g. `api/customers/`) has **one** `middlewares.ts` that covers all routes in the subtree, including nested paths like `/customers/:id`. The `matcher` field identifies which route each entry applies to.

```typescript
// backend/src/api/customers/middlewares.ts
import { IdParams } from '../../core/http-schemas/common.js'
import { CreateCustomers, UpdateCustomer } from '../../core/http-schemas/customer/payloads.js'
import { CustomerListResponse, CustomerResponse, CustomerDeleteResponse } from '../../core/http-schemas/customer/responses.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/customers',
    operationId: 'listCustomers',
    summary: 'List customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerListResponse,
  },
  {
    method: 'POST',
    matcher: '/customers',
    bodySchema: CreateCustomers,
    operationId: 'createCustomers',
    summary: 'Create customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerListResponse,
  },
  {
    method: 'GET',
    matcher: '/customers/:id',
    paramsSchema: IdParams,
    operationId: 'getCustomer',
    summary: 'Retrieve a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerResponse,
  },
  // ...
] satisfies MiddlewareRoute[]
```

### MiddlewareRoute fields

| Field | Required | Description |
|-------|----------|-------------|
| `method` | Yes | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| `matcher` | Yes | Route path (e.g. `/customers/:id`) |
| `paramsSchema` | No | Zod schema for path params — validated before handler |
| `querySchema` | No | Zod schema for query params — validated before handler |
| `bodySchema` | No | Zod schema for request body — validated before handler |
| `responseSchema` | No | Zod schema for response — used for OpenAPI docs only (not validated at runtime) |
| `summary` | No | OpenAPI summary |
| `description` | No | OpenAPI description |
| `operationId` | Yes | Unique operation name — used by Orval to generate function/type names |
| `tags` | Yes | OpenAPI tags — use the `Tags` enum |

### Tags

Tags are defined as an enum in `backend/src/core/middleware/types.ts`. Add new tags there when creating a new module:

```typescript
export const Tags = {
  CUSTOMERS: 'Customers',
  USERS: 'Users',
} as const
```

### How it works

The route loader (`backend/src/routes-loader.ts`) handles everything automatically:

1. Discovers `middlewares.ts` files in each API subdirectory
2. Matches middleware configs to route handlers by `matcher` + `method`
3. Wraps matched handlers with validation (function composition at registration time)
4. Registers matched routes with the OpenAPI registry

Routes without a matching middleware config continue to work unchanged — they just don't get automatic validation or OpenAPI docs.

### Simplified handlers

With middleware handling validation, route handlers become simpler:

```typescript
// Before (manual validation)
export const POST = async (req: HttpRequest): Promise<HttpResult> => {
  const body = validateBody(CreateCustomersBody, req.body)
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(body)
  return { status: 201, json: { customers } }
}

// After (middleware validates)
export const POST = async (req: HttpRequest<CreateCustomerDTO[]>): Promise<HttpResult> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(req.body)
  return { status: 201, json: { customers } }
}
```

Use the `HttpRequest<TBody>` generic to type the pre-validated body.

---

## OpenAPI & Swagger UI

### Endpoints

| URL | Description |
|-----|-------------|
| `GET /openapi.json` | Raw OpenAPI 3.1 JSON spec |
| `GET /docs/` | Interactive Swagger UI |

### Dumping the spec to a file

```bash
npm run --workspace=backend openapi:dump
```

This fetches `/openapi.json` from a running server and saves it to `openapi.json` at the project root.

### Key files

| File | Purpose |
|------|---------|
| `backend/src/openapi/setup.ts` | Calls `extendZodWithOpenApi(z)` — must be imported before any `.openapi()` usage |
| `backend/src/openapi/registry.ts` | Singleton `OpenAPIRegistry` and `generateDocument()` |
| `backend/src/openapi/register-route.ts` | Converts `MiddlewareRoute` configs to `registry.registerPath()` calls |

### How `$ref` works

Schemas that call `.openapi('Name')` are registered in `components/schemas` and referenced via `$ref` throughout the spec. Schemas without `.openapi()` are inlined. Use `.openapi()` on entity and payload schemas to keep the spec clean:

```
components/schemas/Customer    ← from Customer.openapi('Customer')
components/schemas/CreateCustomer  ← from CreateCustomer.openapi('CreateCustomer')
```

---

## Backend-as-library

The middleware system only applies to the HTTP layer. When the frontend imports the backend container directly (via `createServerFn`), it bypasses the router entirely:

- **HTTP path**: Request → middleware (validates) → handler → service
- **Direct import path**: `createServerFn` → container → service

The frontend can import the same Zod schemas from `core/http-schemas/` for its own validation in TanStack's `.validator()`:

```typescript
import { CreateCustomers } from 'backend/src/core/http-schemas/customer/payloads.js'

export const createCustomers = createServerFn({ method: 'POST' })
  .validator((data) => CreateCustomers.parse(data))
  .handler(async ({ data }) => {
    // ...
  })
```

---

## Adding middleware to a new module

1. Create HTTP schemas in `backend/src/core/http-schemas/<domain>/` (entities, payloads, queries, responses)
2. Call `.openapi('Name')` on entity and payload schemas (import `openapi/setup.js` first)
3. Re-export from `backend/src/core/http-schemas/index.ts`
4. Add a tag to the `Tags` enum in `backend/src/core/middleware/types.ts`
5. Create `backend/src/api/<domain>/middlewares.ts` with route configs
6. Remove manual `validateBody()` / `validateQuery()` calls from handlers
