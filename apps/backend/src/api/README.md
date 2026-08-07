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

Export named HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`). Each handler:
1. Defines a local input type with `params`, `body`, and/or `query`
2. Returns `Promise<HttpResult<ResponseType>>` with an explicit response type from `@proteus/http-schemas`
3. Resolves services from `req.scope` (Awilix scoped container)

```ts
import type { AdminCustomerResponse, AdminUpdateCustomerBody, IdParams } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type UpdateInput = { params: IdParams; body: AdminUpdateCustomerBody }
export const PATCH = async (req: HttpRequest<UpdateInput>): Promise<HttpResult<AdminCustomerResponse>> => {
  const service = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const [customer] = await service.updateCustomers([req.params.id], req.body)
  return { status: 200, json: { customer } }
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

Each domain has a `definitions.ts` that exports a `RouteDefinition[]` array. Each definition wires a handler to its validation schemas, auth policy, and OpenAPI metadata:

```ts
import { AdminCreateCustomers, AdminCustomerListResponse, DeleteResponse, IdParams } from '@proteus/http-schemas/admin'
import * as customerRoutes from './route.js'
import * as customerByIdRoutes from './[id]/route.js'

export default [
  {
    method: 'POST',
    matcher: '/admin/customers',
    handler: customerRoutes.POST,
    bodySchema: AdminCreateCustomers,
    operationId: 'createCustomers',
    summary: 'Create customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: AdminCustomerListResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/customers/:id',
    handler: customerByIdRoutes.DELETE,
    paramsSchema: IdParams,
    operationId: 'deleteCustomer',
    summary: 'Delete a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: DeleteResponse,
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
