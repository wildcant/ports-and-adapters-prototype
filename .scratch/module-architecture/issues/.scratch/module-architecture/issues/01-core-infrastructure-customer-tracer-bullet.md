# 01 — Core infrastructure + Customer module (tracer bullet)

**What to build:** The foundational architecture proven end-to-end with one real module. This ticket delivers the core infrastructure that every module depends on — the `Module()` factory, `Modules` enum, `BaseRepository` with soft-delete and transaction propagation, `withTransaction` utility, `SharedContext` type, the two-container bootstrap process, and path aliases (`@core/*`). The Customer module is built as the first module using the new pattern, proving the architecture works: bootstrap creates an isolated local container, bridges the shared pg pool, registers repositories privately, exposes `CustomerModuleService` to the shared container. Entry points (`container.ts`, `index.ts`) are updated to use the new bootstrap. CRUD operations against Postgres with transaction support are verified.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `core/types/shared-context.ts` defines `SharedContext` with optional `transaction` field
- [ ] `core/types/customer/` has `common.ts` (CustomerDTO), `mutations.ts` (CreateCustomerDTO, UpdateCustomerDTO), `service.ts` (ICustomerModuleService interface)
- [ ] `core/types/index.ts` re-exports all type subfolders
- [ ] `core/utils/modules-definition.ts` exports `Modules` enum with all module keys (USER, CUSTOMER, CART, ORDER, PROMOTION, INVENTORY)
- [ ] `core/utils/module.ts` exports `Module()` factory that returns a plain config object (service, repositories, models)
- [ ] `core/utils/base-repository.ts` exports `BaseRepository<TTable>` with `find`, `findById`, `findAndCount`, `create`, `createMany`, `update`, `delete`, `softDelete`, `restore` — all accepting optional `SharedContext` and using `getClient(context)` for transaction propagation
- [ ] `BaseRepository.find` auto-filters `WHERE deleted_at IS NULL`
- [ ] `core/utils/with-transaction.ts` exports `withTransaction(db, context, fn)` — starts new tx or reuses existing from context
- [ ] `core/bootstrap/` wires the two-container architecture: creates local container per module, bridges shared deps (pg pool, logger), creates per-module Drizzle instance, registers repos with explicit keys, instantiates service with `localContainer.cradle`, exposes service in shared container under `Modules.*` key
- [ ] Path aliases configured in tsconfig (`@core/*` maps to `core/*`)
- [ ] `modules/customer/models/customer.ts` defines `customerTable` with `pgTable()`, SQL-level prefixed ID via `gen_random_uuid()`, `deleted_at` column
- [ ] `modules/customer/repositories/customer.ts` extends `BaseRepository`
- [ ] `modules/customer/services/customer-module-service.ts` is class-based with constructor injection, implements `ICustomerModuleService`, uses `withTransaction` for write operations
- [ ] `modules/customer/index.ts` uses `Module(Modules.CUSTOMER, { service, repositories, models })` with explicit repository keys
- [ ] `modules/customer/drizzle.config.ts` points to module's models, outputs to module's migrations folder
- [ ] `container.ts` and `index.ts` updated to use new bootstrap process
- [ ] `container.resolve(Modules.CUSTOMER)` returns a working `CustomerModuleService` singleton
- [ ] Internal repositories are NOT accessible from the shared container
- [ ] Shared pg pool registered as `__pg_connection__`, one pool for the entire app
