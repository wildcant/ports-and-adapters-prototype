# 01 — Backend: Product admin API and admin schema split

**What to build:** Five working admin product endpoints that support the admin portal's product list, detail, create, edit, and delete flows. The list endpoint supports free-text search (ILIKE on title/handle with multi-word tokenization), status filtering, created_at range filtering, sorting, and offset-based pagination. Create auto-generates a handle from the title. Delete is a soft delete.

Before adding new product schemas, establish an explicit admin/store split in `packages/http-schemas`. Currently all schemas live under `src/store/` and are shared between admin and store API routes with no prefix — e.g. `Customer.openapi('Customer')`. This ticket creates `src/admin/` with all admin schemas renamed to carry an `Admin` prefix — both the TypeScript export names and the `.openapi()` string names. For example: `AdminCustomer.openapi('AdminCustomer')`, `AdminCreateCustomer.openapi('AdminCreateCustomer')`, `AdminCustomerResponse.openapi('AdminCustomerResponse')`, etc. All admin middleware files are updated to import from the new admin path. Store schemas remain unchanged.

New product admin schemas are added under `src/admin/product/` following the same `Admin`-prefixed pattern (`AdminProduct`, `AdminCreateProduct`, `AdminProductResponse`, etc.). A `buildSearchFilter(q, searchableColumns)` utility is added that tokenizes whitespace-separated terms and produces `$and`/`$or`/`$ilike` filter shapes compatible with the existing `buildFilters` system — no changes to `BaseRepository` needed. The OpenAPI dump script is updated to include product middleware routes, and `openapi-admin.json` is regenerated. A final validation step confirms every schema name in `openapi-admin.json` carries the `Admin` prefix. Service-level tests validate the full CRUD lifecycle and search/filter behavior.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

**Reference files to study:**

- Proteus — existing schema structure (understand before splitting):
  - `packages/http-schemas/src/store/customer/` — entities, payloads, queries, responses (current pattern, shared between admin and store)
  - `packages/http-schemas/src/store/user/` — same pattern for users
  - `packages/http-schemas/src/common.ts` — `createFindParams()`, `PaginatedResponse`, `IdParams` (shared, stays shared)
  - `packages/http-schemas/src/index.ts` — top-level re-exports (update to export both admin and store paths)
- Proteus — admin middleware files that need import updates (all currently import unprefixed schemas from `@proteus/http-schemas`):
  - `apps/backend/src/api/admin/customers/middlewares.ts` — uses `Customer`, `CreateCustomers`, `CustomerResponse`, etc.
  - `apps/backend/src/api/admin/users/middlewares.ts` — uses `User`, `CreateUser`, `UserResponse`, etc.
  - `apps/backend/src/api/admin/payments/middlewares.ts`
  - `apps/backend/src/api/admin/payment-collections/middlewares.ts`
  - `apps/backend/src/api/admin/refund-reasons/middlewares.ts`
  - `apps/backend/src/api/admin/shipping-options/middlewares.ts`
  - `apps/backend/src/api/admin/shipping-profiles/middlewares.ts`
  - `apps/backend/src/api/admin/fulfillment-sets/middlewares.ts`
  - `apps/backend/src/api/admin/fulfillment-providers/middlewares.ts`
- Proteus — admin route handlers that import types (update these too):
  - `apps/backend/src/api/admin/customers/route.ts`, `[id]/route.ts`
  - `apps/backend/src/api/admin/users/route.ts`, `[id]/route.ts`
  - (and similar for payments, shipping-options, etc.)
- Proteus — backend product module and utilities:
  - `apps/backend/src/modules/product/` — existing product module (service, repositories, models)
  - `apps/backend/src/core/utils/build-filters.ts` — existing filter system (`$or`, `$and`, `$ilike` already supported)
  - `apps/backend/src/core/utils/base-repository.ts` — `BaseRepository` with `find`, `findAndCount`, `buildWhere`
  - `apps/backend/scripts/openapi-dump.ts` — add product middleware imports here

**Admin/store schema split:**

- [ ] Create `packages/http-schemas/src/admin/` directory mirroring the `src/store/` structure
- [ ] Create admin customer schemas in `src/admin/customer/` — copy from `src/store/customer/`, rename all exports with `Admin` prefix (e.g. `AdminCustomer`, `AdminCreateCustomer`, `AdminCustomerResponse`, `AdminCustomerListResponse`, `AdminCustomerDeleteResponse`, `AdminCustomerListParams`, `AdminUpdateCustomer`)
- [ ] Rename `.openapi()` string names to match: `'AdminCustomer'`, `'AdminCreateCustomer'`, `'AdminCustomerResponse'`, etc.
- [ ] Create admin user schemas in `src/admin/user/` — same prefix treatment (`AdminUser`, `AdminCreateUser`, `AdminUserResponse`, etc.)
- [ ] Create admin schemas for all other domains used by admin middleware (payments, refund-reasons, shipping-options, shipping-profiles, fulfillment-sets, fulfillment-providers, payment-collections) — each with `Admin` prefix
- [ ] Update `packages/http-schemas/src/index.ts` to re-export both admin and store schemas
- [ ] Update all admin middleware files to import `Admin`-prefixed schemas
- [ ] Update all admin route handler files to import `Admin`-prefixed types
- [ ] Store schemas and store route handlers remain unchanged — no `Store` prefix needed

**Product admin API:**

- [ ] Product admin schemas added to `packages/http-schemas/src/admin/product/` with `Admin` prefix: `AdminProduct`, `AdminCreateProduct`, `AdminUpdateProduct`, `AdminProductResponse`, `AdminProductListResponse`, `AdminProductDeleteResponse`, `AdminProductListParams`
- [ ] `AdminProductListParams` extends `createFindParams()` with `q` (string), `status` (string or string array), and `created_at` (object with `$gte`/`$lte` operators)
- [ ] `AdminCreateProduct` payload requires only `title`; `AdminUpdateProduct` has optional `title`
- [ ] `buildSearchFilter(q, searchableColumns)` utility tokenizes by whitespace, produces `$and`/`$or`/`$ilike` filter shapes
- [ ] Multi-word search: each token must match at least one searchable column (`$or`), all tokens must match (`$and`)
- [ ] `GET /admin/products` supports `offset`, `limit`, `order`, `q`, `status`, `created_at` query params and returns `{ products, count, offset, limit }`
- [ ] `POST /admin/products` creates a product with auto-generated handle (slugified from title) and returns `{ product }`
- [ ] `GET /admin/products/:id` retrieves a single product and returns `{ product }`
- [ ] `PATCH /admin/products/:id` updates a product and returns `{ product }`
- [ ] `DELETE /admin/products/:id` soft-deletes a product and returns `{ id, deleted: true }`
- [ ] Middleware route configs include OpenAPI metadata (operationId, summary, tags, schemas)
- [ ] `openapi-dump.ts` updated with product middleware imports

**Validation and regeneration:**

- [ ] `openapi-admin.json` regenerated with product endpoints and all renamed admin schemas
- [ ] Validate: every schema name in `openapi-admin.json` under `components.schemas` carries the `Admin` prefix (no unprefixed `Customer`, `User`, etc.)
- [ ] Service tests cover: list with pagination, list with single-word `q` search, list with multi-word `q` search, list with status filter, list with created_at range filter, create with auto-generated handle, update, soft delete (excluded from subsequent list), retrieve by ID
