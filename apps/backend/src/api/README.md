# API Route Conventions

File-based routing with `[id]` params. Each domain folder contains a `route.ts` for the collection and `[id]/route.ts` for individual resources.

## File Structure

```
src/api/
├── admin/
│   └── <domain>/
│       ├── route.ts           # GET (list), POST (create)
│       ├── [id]/
│       │   └── route.ts       # GET (retrieve), PATCH/POST (update), DELETE
│       └── definitions.ts    # Route definitions (handler, auth, schemas, OpenAPI metadata)
└── store/
    └── <domain>/              # Same structure
```

## Route Handler Pattern

Export named HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`). Each handler co-exports its `Input` and `Output` constants so the definition file can reference them. Each handler:
1. Co-exports an `Input` constant (`{ params?, body?, query? }`) and an `Output` schema
2. Uses `HttpRequest<typeof Input>` and `Promise<HttpResult<typeof Output>>` for type safety
3. Resolves services from `req.scope` (Awilix scoped container)

```ts
import { AdminCreateCustomers, AdminCreateCustomersResponse } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const PostInput = { body: AdminCreateCustomers }
export const PostOutput = AdminCreateCustomersResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(req.body)
  return { status: 201, json: { customers } }
}
```

## Response Type Rules

- **Never use `HttpResult<any>`** — always provide a typed response from `@proteus/http-schemas`
- **DELETE endpoints** use the shared `DeleteResponse` (returns `{ id, deleted: true }`)
- **Webhook endpoints** use `WebhookReceivedResponse` (returns `{ received: true }`)
- **Batch create** — if the payload is an array, return an array (e.g. `{ customers: [...] }`)

## Status Codes

| Operation | Status |
|-----------|--------|
| GET       | 200    |
| POST create | 201  |
| PATCH/POST update | 200 |
| DELETE    | 200    |

## Definition File

Each domain has a `definitions.ts` that default-exports a `RouteDefinition[]` array. Each definition wires a handler to its `input`/`output` schemas (co-exported from the route file), auth policy, and OpenAPI metadata:

```ts
import type { RouteDefinition } from '@framework/http/types.js'
import { Tags } from '@framework/http/types.js'
import * as customerRoutes from './route.js'
import * as customerByIdRoutes from './[id]/route.js'

export default [
  {
    method: 'POST',
    matcher: '/admin/customers',
    handler: customerRoutes.POST,
    input: customerRoutes.PostInput,
    operationId: 'createCustomers',
    summary: 'Create customers',
    tags: [Tags.CUSTOMERS],
    output: customerRoutes.PostOutput,
  },
  {
    method: 'DELETE',
    matcher: '/admin/customers/:id',
    handler: customerByIdRoutes.DELETE,
    input: customerByIdRoutes.DeleteInput,
    operationId: 'deleteCustomer',
    summary: 'Delete a customer',
    tags: [Tags.CUSTOMERS],
    output: customerByIdRoutes.DeleteOutput,
  },
] satisfies RouteDefinition[]
```

### Auth Policy

Admin and store routes default to `auth: 'required'`. Override with:
- `auth: 'public'` — no auth (e.g. store product browsing)
- `auth: 'optional'` — guests proceed, authenticated users get context
- `auth: 'unregistered'` — valid JWT required, actor record not required

Routes outside `/admin/` and `/store/` (e.g. `/auth/`, `/hooks/`) use explicit `middlewares` for auth.

## Checklist for Adding a New Endpoint

1. Define entity, payload, query, and response schemas in `packages/http-schemas/src/<scope>/<domain>/`
2. Create `route.ts` with typed handler(s)
3. Create or update `definitions.ts` with route definitions (handler, schemas, OpenAPI metadata)
4. Add the definition import to `src/routes.ts`
5. Run `npm run --workspace=backend typecheck` — zero errors
6. Run `npm run openapi:generate` to regenerate OpenAPI specs and clients
