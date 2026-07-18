# Architecture Decisions — Module Structure & Initialization

Summary of decisions made during the grilling session. Reference implementation: Medusa.js (`medusa-source/packages/`). Use case: e-commerce checkout journey.

---

## 1. Module Isolation: Per-Module Container (Level C)

Each module gets its own private Awilix container. The shared/global container only exposes the module's public service. Internal repositories, helpers, and the module's own Drizzle instance are invisible to other modules.

```
shared container:
  "__pg_connection__"  →  postgres() client (pool)
  "order"              →  OrderModuleService (public API)
  "cart"               →  CartModuleService (public API)
  ...

order local container (private):
  "db"                 →  drizzle(client) instance
  "logger"             →  bridged from shared container
  "orderRepository"    →  OrderRepository
  "orderItemRepository"→  OrderItemRepository
```

Infrastructure deps (logger, pg pool) are singletons in the shared container, bridged into local containers and injected via constructor — never accessed globally.

---

## 2. Module Definition API

Declarative `Module()` factory. Fully explicit — service, repositories, and models are all listed.

```typescript
// modules/order/index.ts
import { Module } from "@core/utils"
import { Modules } from "@core/utils/modules-definition"
import { OrderModuleService } from "./services/order-module-service.js"
import { OrderRepository, OrderItemRepository } from "./repositories/index.js"
import { orderTable, orderItemTable } from "./models/index.js"

export default Module(Modules.ORDER, {
  service: OrderModuleService,
  repositories: {
    orderRepository: OrderRepository,
    orderItemRepository: OrderItemRepository,
  },
  models: [orderTable, orderItemTable],
})
```

`Module()` does no container work — it returns a plain config object. The bootstrap process reads this config and wires the two-container architecture.

---

## 3. Modules Enum

```typescript
// core/utils/modules-definition.ts
export const Modules = {
  USER: "user",
  CUSTOMER: "customer",
  CART: "cart",
  ORDER: "order",
  PAYMENT: "payment",
  PROMOTION: "promotion",
  INVENTORY: "inventory",
} as const
```

These strings are the exact keys used for `container.register()` and `container.resolve()`.

---

## 4. Module Folder Structure

```
modules/order/
  models/
    order.ts              ← pgTable() + $inferSelect/$inferInsert types
    order-item.ts
    index.ts
  repositories/
    order.ts              ← extends BaseRepository, custom queries
    order-item.ts
    index.ts
  services/
    order-module-service.ts  ← class, constructor injection, public API
    index.ts
  migrations/
    0000_initial.sql
  types/
    index.ts              ← internal DTOs, internal-only type definitions
  utils/
    index.ts              ← runtime helpers consumed by services
  drizzle.config.ts       ← per-module migration config
  index.ts                ← Module() definition
```

- `types/` — compile-time only. Create/Update DTOs, internal calculation types, module config types. No runtime code.
- `utils/` — runtime helpers. Validation, domain logic engines, query builders. Private to the module.

---

## 5. Service Layer: One-Tier

Module service talks directly to repositories. No internal per-model service layer.

```typescript
// services/order-module-service.ts
type InjectedDependencies = {
  orderRepository: OrderRepository
  orderItemRepository: OrderItemRepository
  logger?: Logger
}

class OrderModuleService implements IOrderModuleService {
  private orderRepository: OrderRepository
  private orderItemRepository: OrderItemRepository
  private logger: Logger
  private db: PostgresJsDatabase

  constructor({ orderRepository, orderItemRepository, logger }: InjectedDependencies) {
    this.orderRepository = orderRepository
    this.orderItemRepository = orderItemRepository
    this.logger = logger
  }

  async createOrder(data: CreateOrderDTO, context: SharedContext = {}) {
    return withTransaction(this.db, context, async (ctx) => {
      const order = await this.orderRepository.create(orderData, ctx)
      const items = await this.orderItemRepository.createMany(itemsData, ctx)
      return { ...order, items }
    })
  }
}
```

---

## 6. Repository Pattern: BaseRepository + Per-Model Extensions

```typescript
// core/utils/base-repository.ts
class BaseRepository<TTable extends PgTable> {
  protected db: PostgresJsDatabase
  protected table: TTable

  protected getClient(context?: SharedContext) {
    return context?.transaction ?? this.db
  }

  async find(filters?, context?): Promise<TSelect[]>
  async findById(id: string, context?): Promise<TSelect | null>
  async findAndCount(filters?, context?): Promise<[TSelect[], number]>
  async create(data: TInsert, context?): Promise<TSelect>
  async createMany(data: TInsert[], context?): Promise<TSelect[]>
  async update(id: string, data: Partial<TInsert>, context?): Promise<TSelect>
  async delete(id: string, context?): Promise<void>
  async softDelete(id: string, context?): Promise<void>
  async restore(id: string, context?): Promise<void>
}
```

- Every table has a `deleted_at` column. `find` queries auto-filter `WHERE deleted_at IS NULL`.
- Per-model repos extend BaseRepository and add custom queries (explicit joins, specialized filters).

---

## 7. Models: Plain Drizzle Tables

```typescript
// modules/order/models/order.ts
export const orderTable = pgTable("order", {
  id: text("id").primaryKey().default(
    sql`CONCAT('ord_', REPLACE(gen_random_uuid()::text, '-', ''))`
  ),
  customer_id: text("customer_id"),       // cross-module — plain text, no .references()
  status: text("status").notNull().default("pending"),
  total_amount: integer("total_amount").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
})

export type Order = typeof orderTable.$inferSelect
export type CreateOrder = typeof orderTable.$inferInsert
```

Rules:
- `.references()` only within the same module (intra-module FKs)
- Cross-module columns are plain `text()` — no `.references()`
- No Drizzle `relations()` within modules — use explicit joins in repositories
- No prefix on table names by default; manually prefix when collisions arise (e.g., `cart_address`, `order_address`)

---

## 8. Database Connection & Transaction Strategy

### Shared pool, per-module Drizzle instance

```
Postgres
  ^
postgres() client (one pool per app)
  ^
registered as "__pg_connection__" in shared container
  ^
bridged into each module's local container
  ^
each module: drizzle(client) → own Drizzle instance
  ^
injected into repositories as "db"
```

### No cross-module transactions

Each module service manages its own transactions via `withTransaction`. Modules cannot share a transaction. Cross-module consistency is achieved via saga/compensation in workflows.

### Transaction propagation within a module

```typescript
// core/utils/with-transaction.ts
async function withTransaction<T>(
  db: PostgresJsDatabase,
  context: SharedContext,
  fn: (context: SharedContext) => Promise<T>,
): Promise<T> {
  if (context.transaction) {
    return fn(context)              // already in a tx — reuse (short-circuit)
  }
  return db.transaction(async (tx) => {
    return fn({ ...context, transaction: tx })  // start new tx — propagate
  })
}
```

Two-tier priority chain (simplified from Medusa's three-tier):

| Priority | Source | When |
|----------|--------|------|
| 1st | `context.transaction` | Inside a transaction — reuse it |
| 2nd | `this.db` | No transaction — use base Drizzle instance |

No decorators. Explicit `withTransaction` calls + `SharedContext` passing.

### SharedContext

```typescript
// core/types/shared-context.ts
export type SharedContext = {
  transaction?: PostgresJsTransaction
}
```

---

## 9. ID Generation: SQL-Level Prefixed IDs

Prefixed IDs are generated at the SQL level via Postgres `gen_random_uuid()` in the column default. The prefix is defined once in the model definition — no app-level utility, no second source of truth that could get out of sync.

```typescript
// modules/order/models/order.ts
export const orderTable = pgTable("order", {
  id: text("id").primaryKey().default(
    sql`CONCAT('ord_', REPLACE(gen_random_uuid()::text, '-', ''))`
  ),
  // ...
})
```

Produces IDs like: `ord_550e8400e29b41d4a716446655440000`

- `gen_random_uuid()` is built into Postgres 13+ (no extension needed)
- The prefix lives in one place (the column default) — no `generateEntityId` utility to keep in sync
- Repositories use `.returning()` to get the generated ID after INSERT:

```typescript
const [order] = await db.insert(orderTable).values(data).returning()
// order.id === "ord_550e8400e29b..."
```

- When creating parent + children in the same transaction, INSERT the parent first, use the returned ID for children — standard SQL pattern, no extra roundtrip within a transaction

---

## 10. Central Types Package

Public type contracts live in `core/types/`, not on individual modules. Prevents circular imports and keeps workflows/API routes decoupled from module implementations.

```
core/types/
  order/
    common.ts         ← OrderDTO, OrderItemDTO (read shapes)
    mutations.ts      ← CreateOrderDTO, UpdateOrderDTO (write shapes)
    service.ts        ← IOrderModuleService interface
    index.ts
  cart/
    common.ts
    mutations.ts
    service.ts
    index.ts
  customer/
  inventory/
  payment/
  promotion/
  user/
  shared-context.ts
  index.ts            ← export * from "./order", export * from "./cart", ...
```

Import: `import { CreateOrderDTO, IOrderModuleService, SharedContext } from "@core/types"`

Modules' internal `types/` folders are for internal-only DTOs that differ from the public contract.

---

## 11. Link Modules

Cross-module join tables and relations. Flat structure mirroring Medusa.

```
link-modules/
  definitions/
    order-cart.ts              ← pgTable + relations() — writable
    order-payment.ts
    order-promotion.ts
    readonly/
      cart-customer.ts         ← relations() only — no join table
      order-customer.ts
      index.ts
    index.ts
  migrations/
  drizzle.config.ts
  index.ts
```

### Writable link (has join table)

```typescript
// definitions/order-cart.ts
export const orderCartLink = pgTable("order_cart", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull(),
  cart_id: text("cart_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const orderCartRelations = relations(orderCartLink, ({ one }) => ({
  order: one(orderTable, { fields: [orderCartLink.order_id], references: [orderTable.id] }),
  cart: one(cartTable, { fields: [orderCartLink.cart_id], references: [cartTable.id] }),
}))
```

### Read-only link (traverses existing FK)

```typescript
// definitions/readonly/cart-customer.ts
export const cartCustomerRelations = relations(cartTable, ({ one }) => ({
  customer: one(customerTable, { fields: [cartTable.customer_id], references: [customerTable.id] }),
}))
```

`relations()` is exclusively a cross-module concern — only appears in link-modules. Link table migrations run after module migrations.

---

## 12. Migration Strategy: Per-Module

Each module has its own `drizzle.config.ts` and `migrations/` folder.

```
modules/order/drizzle.config.ts      → modules/order/migrations/
modules/cart/drizzle.config.ts       → modules/cart/migrations/
link-modules/drizzle.config.ts       → link-modules/migrations/
```

Run order: module migrations first, link-module migrations second.

---

## 13. Core Folder Structure

```
backend/src/
  core/
    types/              ← public type contracts (per-domain subfolders)
    utils/              ← Module() factory, Modules enum, LINKS enum,
                           BaseRepository, withTransaction
    bootstrap/          ← module loading, two-container wiring logic
  modules/
    user/               ← renamed from identity
    customer/
    cart/
    order/
    payment/
    promotion/
    inventory/
  link-modules/
    definitions/
    migrations/
  api/                  ← route handlers (existing)
  server/               ← app, ports, platforms (existing)
```

---

## 14. Bootstrap Flow (Simplified from Medusa)

```
1. Create shared container
2. Register pg pool as "__pg_connection__"
3. Register logger

4. For each module definition:
   a. Import Module() config → { service, repositories, models }
   b. Create local container
   c. Bridge shared deps into local container (db pool, logger)
   d. Create per-module Drizzle instance in local container
   e. Register repositories in local container (explicit keys from config)
   f. Instantiate module service with localContainer.cradle
   g. Register module service in shared container as Modules.XXX

5. Shared container now has:
   "__pg_connection__", "logger",
   "user", "customer", "cart", "order", "payment", "promotion", "inventory"

6. container.resolve(Modules.ORDER) → OrderModuleService singleton
```

---

## Decisions NOT Yet Made (Deferred)

- Workflow/saga orchestration (createStep, createWorkflow, compensation)
- Event bus (local vs Redis, event grouping)
- API route structure for new modules
- Frontend integration with new modules
- Provider pattern (payment gateways, etc.)
- Observability (tracing, metrics)
