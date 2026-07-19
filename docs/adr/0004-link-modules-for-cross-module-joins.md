# 4. Link Modules for Cross-Module Joins

**Status:** Accepted

## Context

Modules must remain independent — they don't import each other's models. But queries often need to traverse relationships across modules (e.g., "get order with its cart" or "get cart with its customer").

Options:
- **Direct imports:** Module A imports Module B's table for joins. Breaks independence.
- **Query module services:** Module A calls Module B's service to fetch related data. N+1 risk, no SQL-level joins.
- **Link modules:** A separate concern defines cross-module relationships and join tables.

Medusa uses link modules — a flat structure of relation definitions and optional join tables that sit outside any individual module.

## Decision

Cross-module relationships are defined in `link-modules/definitions/`. Two types:

**Writable links** (join table needed — many-to-many or when the relationship itself carries data). Join tables enforce FK constraints — the database guarantees referential integrity across modules:
```typescript
export const orderCartLink = pgTable("order_cart", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull().references(() => orderTable.id),
  cart_id: text("cart_id").notNull().references(() => cartTable.id),
})
```

**Read-only links** (traversing an existing FK — no join table, just a Drizzle `relations()` definition):
```typescript
export const cartCustomerRelations = relations(cartTable, ({ one }) => ({
  customer: one(customerTable, {
    fields: [cartTable.customer_id],
    references: [customerTable.id],
  }),
}))
```

`relations()` appears exclusively in link-modules — never inside a module.

## Consequences

- Modules stay fully independent — no cross-module imports in module code
- Cross-module query capability lives in one discoverable place
- DB-level FK constraints on join tables guarantee referential integrity across modules
- Link module migrations run after module migrations (ordering matters — referenced tables must exist first)
- Adding a new cross-module relationship doesn't touch either module's code
- Deleting a linked entity requires handling the FK constraint (delete link row first, or use ON DELETE CASCADE/SET NULL)
- Slightly more indirection for simple FK traversals vs direct joins
