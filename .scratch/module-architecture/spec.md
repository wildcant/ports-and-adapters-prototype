Status: ready-for-agent

# Spec: Production Module Architecture

Restructure the ports-and-adapters prototype from a single-module demo into a production-grade modular architecture, using the Medusa.js checkout journey as the reference use case.

---

## Problem Statement

The prototype currently has one module (identity) that demonstrates ORM adapter swapping. It has a flat Awilix container, no module isolation, no shared infrastructure layer, and no cross-module communication pattern. It cannot support a multi-module system like an e-commerce checkout journey where cart, order, payment, promotion, inventory, and customer modules must coexist with clear boundaries, independent transactions, and cross-module queries.

## Solution

Introduce a Medusa-inspired module architecture with per-module container isolation, a central types package, a declarative Module() factory, a BaseRepository with soft-delete and transaction propagation, link modules for cross-module joins, and a bootstrap process that wires it all together. Rename the existing identity module to user. Add six new commerce modules (customer, cart, order, payment, promotion, inventory) and three link module definitions (order-cart, order-payment, order-promotion) plus read-only links. The architecture enforces module independence: no cross-module transactions, no cross-module imports, no shared ORM instances.

## User Stories

1. As a developer, I want a `Module()` factory that declaratively defines a module's service, repositories, and models, so that every module has a consistent entry point.
2. As a developer, I want a `Modules` enum (`USER`, `CUSTOMER`, `CART`, `ORDER`, `PROMOTION`, `INVENTORY`), so that I can resolve module services from the container by a stable key.
3. As a developer, I want each module to have its own private Awilix container, so that internal repositories and helpers are invisible to other modules.
4. As a developer, I want only the module's public service exposed in the shared container, so that modules interact exclusively through their public APIs.
5. As a developer, I want shared infrastructure (pg connection pool, logger) bridged into each module's local container via constructor injection, so that modules receive dependencies without global imports.
6. As a developer, I want each module to create its own Drizzle instance wrapping the shared connection pool, so that per-module transactions are independent.
7. As a developer, I want a `withTransaction` utility that starts a new transaction or reuses an existing one from `SharedContext`, so that intra-module operations are atomic without decorators.
8. As a developer, I want `SharedContext` to only propagate within a module's own service/repository chain, so that cross-module transactions are architecturally impossible.
9. As a developer, I want a `BaseRepository` class with `find`, `findById`, `findAndCount`, `create`, `createMany`, `update`, `delete`, `softDelete`, and `restore` methods, so that every repository inherits standard CRUD without boilerplate.
10. As a developer, I want `BaseRepository.find` to auto-filter `WHERE deleted_at IS NULL`, so that soft-deleted records are excluded by default.
11. As a developer, I want every repository method to accept an optional `SharedContext` parameter and use `getClient(context)` to resolve the active transaction or base db, so that transaction propagation is automatic.
12. As a developer, I want per-model repositories that extend `BaseRepository` and add custom queries with explicit Drizzle joins, so that complex queries are transparent and SQL-visible.
13. As a developer, I want models defined as plain Drizzle `pgTable()` calls with `$inferSelect` and `$inferInsert` types, so that domain types are derived from the schema with no duplication.
14. As a developer, I want `.references()` used only for intra-module foreign keys, so that modules remain schema-independent from each other.
15. As a developer, I want cross-module columns to be plain `text()` with no `.references()`, so that modules can be swapped or split without FK conflicts.
16. As a developer, I want a central `core/types/` package with per-domain subfolders (`common.ts`, `mutations.ts`, `service.ts`), so that public type contracts live independently of module implementations.
17. As a developer, I want to import all public types from `@core/types`, so that workflows and API routes have a single import path for cross-domain types.
18. As a developer, I want each module's internal `types/` folder for internal-only DTOs that differ from the public contract, so that internal implementation details don't leak.
19. As a developer, I want writable link modules as `pgTable()` join tables with `relations()` for Drizzle's relational query API, so that cross-module data can be queried with SQL joins.
20. As a developer, I want read-only link modules as `relations()` definitions only (no join table), so that existing FK columns can be traversed cross-module without extra tables.
21. As a developer, I want link module `relations()` to be the only place Drizzle's relational API is used, so that there is a clean separation: `relations()` = cross-module, `.references()` + explicit joins = intra-module.
22. As a developer, I want per-module `drizzle.config.ts` files pointing to the module's `models/` folder, so that each module generates and runs its own migrations independently.
23. As a developer, I want link-module migrations to run after module migrations, so that referenced tables exist before join tables are created.
24. As a developer, I want prefixed IDs (e.g., `ord_<uuid>`, `cart_<uuid>`) generated at the SQL level via column defaults, so that entity origins are immediately identifiable in logs and link tables with a single source of truth for the prefix.
25. As a developer, I want a bootstrap process that reads Module() configs, creates local containers, bridges shared deps, registers repositories, instantiates services, and exposes them in the shared container, so that module startup is automated and consistent.
26. As a developer, I want module services to be class-based with constructor injection (`constructor({ orderRepository, logger }: InjectedDependencies)`), so that dependencies are explicit and testable.
27. As a developer, I want one-tier services (service talks directly to repositories, no internal per-model service layer), so that the call chain is simple and readable.
28. As a developer, I want the existing identity module renamed to `user` (matching Medusa's convention for admin users), so that the module naming is consistent with the reference architecture.
29. As a developer, I want table names to be unprefixed by default with manual prefixing only on collision (e.g., `cart_address` vs `order_address`), so that SQL stays readable.
30. As a developer, I want each module to follow a standard folder structure (`models/`, `repositories/`, `services/`, `migrations/`, `types/`, `utils/`), so that navigating any module is predictable.
31. As a developer, I want a `core/` folder containing `types/`, `utils/`, and `bootstrap/`, so that shared infrastructure is centralized and distinct from module code.
32. As a developer, I want a `LINKS` enum for link module keys, so that link tables have the same stable-key pattern as modules.

## Implementation Decisions

### Module Definition API

Every module exports via a `Module()` factory that returns a plain config object (no container work). The bootstrap process reads this config to wire the two-container architecture.

The `Module()` call is fully explicit: service class, repositories as a key-value object, and models as an array of Drizzle table definitions. Repository keys in the object must match the keys used in the service's `InjectedDependencies` type.

### Two-Container Architecture

Each module gets its own private Awilix container (local container). Shared infrastructure deps (pg connection pool, logger) are singletons in the shared container, lazily bridged into local containers. Each module creates its own Drizzle instance wrapping the shared pool. Repositories are registered in the local container with explicit keys. The module service is instantiated with `localContainer.cradle` and registered in the shared container under its `Modules` enum key.

### Transaction Strategy

No cross-module DB transactions. Each module service manages its own transactions via `withTransaction(db, context, fn)`. If `context.transaction` exists, it reuses (short-circuits). Otherwise it starts a new one. The two-tier priority chain: (1) `context.transaction` if present, (2) `this.db` fallback. No decorators — explicit function calls with `SharedContext` passing.

Cross-module consistency is deferred to the workflow/saga layer (out of scope for this spec).

### Database Connection

One `postgres()` connection pool registered as `__pg_connection__` in the shared container. Each module creates its own `drizzle(client)` instance in its local container. This mirrors Medusa's pattern: shared pool for efficiency, independent ORM instances for transaction isolation.

### Service Layer

One-tier: module service classes talk directly to repositories. No auto-generated internal per-model service layer. Services use constructor injection with typed `InjectedDependencies`.

### Repository Pattern

`BaseRepository<TTable>` provides standard CRUD operations. Every table has a `deleted_at` column; `find` auto-filters soft-deleted records. Every method accepts optional `SharedContext` and uses `getClient(context)` to resolve the active transaction or base db instance. Per-model repositories extend `BaseRepository` and add custom queries using explicit Drizzle joins (no Drizzle relational API within modules).

### Models

Plain Drizzle `pgTable()` definitions. Domain types derived via `$inferSelect`/`$inferInsert`. Intra-module FKs use `.references()`. Cross-module columns are plain `text()`. Table names are unprefixed by default; manually prefix on collision.

### Central Types Package

Public type contracts live in `core/types/` with per-domain subfolders. Each subfolder has `common.ts` (read DTOs), `mutations.ts` (write DTOs), `service.ts` (module service interface). Root `index.ts` re-exports all domains. `SharedContext` type lives in `core/types/shared-context.ts`.

Modules' internal `types/` folders contain internal-only DTOs that may differ from the public contract.

### Link Modules

Writable links: `pgTable()` join table + Drizzle `relations()` in the same file. Read-only links: `relations()` only, traversing an existing FK column. Structure mirrors Medusa: `link-modules/definitions/` for writable, `link-modules/definitions/readonly/` for read-only. `relations()` is exclusively a cross-module concern.

### ID Generation

Prefixed IDs generated at the SQL level via Postgres `gen_random_uuid()` in the column default. Each model defines its prefix inline — no app-level utility, no second source of truth for the prefix string. Format: `{prefix}_{uuid}`. Repositories use `.returning()` to get the generated ID after INSERT.

From the grilling session:
```typescript
// Model definition — prefix defined once, here only
id: text("id").primaryKey().default(
  sql`CONCAT('ord_', REPLACE(gen_random_uuid()::text, '-', ''))`
)
```

### Migrations

Per-module `drizzle.config.ts` and `migrations/` folder. Link-modules have their own config and migrations. Run order: module migrations first, link-module migrations second.

### Module Inventory

Rename the existing `identity` module to `user` (drop adapter-swapping demo — original code preserved on `prototype-reference` branch). Add five new modules: `customer`, `cart`, `order`, `promotion`, `inventory`. Add two writable link definitions: `order-cart`, `order-promotion`. Add read-only links as needed (e.g., `cart-customer`, `order-customer`). Payment module is deferred — it requires a provider/adapter pattern that is out of scope.

### Folder Structure

```
backend/src/
  core/
    types/              -- public type contracts (per-domain subfolders)
    utils/              -- Module(), Modules, LINKS, BaseRepository,
                           withTransaction
    bootstrap/          -- module loading, two-container wiring
  modules/
    user/               -- renamed from identity
    customer/
    cart/
    order/
    payment/
    promotion/
    inventory/
  link-modules/
    definitions/
      readonly/
    migrations/
    drizzle.config.ts
  api/
  server/
```

Each module follows:

```
modules/<name>/
  models/
  repositories/
  services/
  migrations/
  types/
  utils/
  drizzle.config.ts
  index.ts              -- Module() definition
```

## Testing Decisions

Testing infrastructure is deferred to a future session. The plan follows Medusa's three-layer pyramid, testing at boundaries not internals:

**Layer 1 — Module Integration Tests:** Test each module's public service interface against a real Postgres database. Bootstrap the module, call service methods, assert outcomes. This transitively exercises repositories, models, bootstrap wiring, and transaction propagation. No HTTP, no workflows, no other modules.

**Layer 2 — Workflow Integration Tests:** Boot the full application, test workflows that orchestrate across multiple modules. Validates cross-module coordination and compensation.

**Layer 3 — HTTP Integration Tests:** Test the complete stack from HTTP request through API routes to database and back.

**What makes a good test:** Test external behavior at boundaries. Models, repositories, internal types, and loaders are NOT tested directly — they are validated transitively through service-level tests. Unit tests are reserved for standalone logic with meaningful complexity (calculation engines, rule evaluators).

**Prior art:** None in the current codebase. Medusa's `moduleIntegrationTestRunner` and `medusaIntegrationTestRunner` serve as the reference patterns.

## Out of Scope

- Workflow/saga orchestration (`createStep`, `createWorkflow`, compensation logic)
- Event bus (local or Redis, event grouping, subscribers)
- API routes for new modules
- Frontend integration with new modules
- Provider pattern (payment gateways, fulfillment providers)
- Observability (tracing, metrics, structured logging)
- Testing infrastructure implementation
- Authentication/authorization
- Payment module (requires a provider/adapter pattern — future work)
- The `completeCartWorkflow` implementation (depends on this architecture being in place first)

## Further Notes

- The architecture-decisions document at `docs/architecture-decisions.md` contains the full decision log from the grilling session, including code examples for each pattern. It should be treated as the authoritative reference during implementation.
- The Medusa source at `medusa-source/packages/` is the reference implementation. Key paths: `packages/modules/` for module structure, `packages/core/types/` for the central types package, `packages/modules/link-modules/` for link module patterns, `packages/core/utils/src/modules-sdk/` for the `Module()` factory and bootstrap logic.
- The existing prototype's adapter-swapping demo (Drizzle/Prisma/Supabase) is preserved on the `prototype-reference` branch. The user module rename drops the adapter directories in favor of a single Postgres implementation using BaseRepository.
- When implementing, start with `core/` infrastructure (types, utils, bootstrap), then one module end-to-end (e.g., `customer` as the simplest), then the remaining modules, then link modules last.
