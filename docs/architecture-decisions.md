# Architecture Overview

Decisions made during the grilling session. Each major decision has a dedicated ADR in `docs/adr/`. This file serves as a quick-reference map.

---

## ADRs

| # | Decision | Summary |
|---|----------|---------|
| [0001](adr/0001-per-module-container-isolation.md) | Per-module container isolation | Private Awilix container per module; only the service is exposed to the shared container |
| [0002](adr/0002-no-cross-module-transactions.md) | No cross-module transactions | Each module owns its transactional boundary; cross-module consistency via sagas |
| [0003](adr/0003-sql-level-prefixed-ids.md) | SQL-level prefixed IDs | `gen_random_uuid()` + prefix in column default; single source of truth |
| [0004](adr/0004-link-modules-for-cross-module-joins.md) | Link modules for cross-module joins | `relations()` and join tables live in `link-modules/`, not inside modules |
| [0005](adr/0005-central-types-package.md) | Central types package | Public contracts in `core/types/`; prevents circular imports |
| [0006](adr/0006-soft-delete-by-default.md) | Soft-delete by default | Every table has `deleted_at`; BaseRepository auto-filters; hard delete available for purge |
| [0007](adr/0007-zero-dependency-web-standard-router.md) | Zero-dependency Web Standard router | Custom `fetch(Request) → Response` router; runs on any platform; no framework lock-in |
| [0008](adr/0008-operator-based-filter-system.md) | Operator-based filter system | Structured `$eq/$in/$like/$and/$or` filters translated to SQL in BaseRepository |

---

## Additional Conventions (not ADR-worthy)

These are patterns that follow naturally from the ADRs or are easy to change later.

### Module definition API

Declarative `Module()` factory returns a plain config object. Bootstrap reads it.

```typescript
export default Module(Modules.ORDER, {
  service: OrderModuleService,
  repositories: { orderRepository: OrderRepository },
})
```

### One-tier services

Module service talks directly to repositories. No internal per-model service layer.

### Repository pattern

`BaseRepository(table)` factory returns a class with full CRUD, filtering, pagination, and soft-delete. Extend for custom queries.

### Models

Plain Drizzle `pgTable()`. Every table has `id`, `created_at`, `updated_at`, `deleted_at`. Use `.references()` only for intra-module FKs. Cross-module columns are plain `text()`.

### Transaction propagation

Injected `withTransaction` helper. Short-circuits if `context.transaction` already exists, otherwise starts a new transaction.

### Per-module migrations

Each module has its own `drizzle.config.ts` and `migrations/` folder. Link module migrations run after module migrations.

### Modules enum

```typescript
export const Modules = {
  USER: 'user',
  CUSTOMER: 'customer',
  CART: 'cart',
  ORDER: 'order',
  PROMOTION: 'promotion',
  INVENTORY: 'inventory',
} as const
```

---

## Decisions Deferred

- Workflow/saga orchestration (compensation, step rollback)
- Event bus (local vs Redis)
- Provider pattern (payment gateways, shipping, etc.)
- Observability (tracing, metrics)
