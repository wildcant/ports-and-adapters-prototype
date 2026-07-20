# 07 — Link modules

**What to build:** Cross-module join tables and relation definitions that enable querying across module boundaries. Two writable links with their own join tables (order-cart, order-promotion) and two read-only links that traverse existing FK columns (cart-customer, order-customer). A `LINKS` enum for stable link keys. Link-module drizzle config and migrations. Cross-module queries via Drizzle's relational API verified — e.g., querying an order with its linked cart, or a cart with its customer.

**Blocked by:** 04 — Promotion module, 05 — Cart module, 06 — Order module

**Status:** ready-for-agent

- [ ] `core/utils/modules-definition.ts` exports `LINKS` enum with keys: `OrderCart`, `OrderPromotion`
- [ ] `link-modules/definitions/order-cart.ts` defines `orderCartLink` pgTable (id, order_id, cart_id, created_at) + `orderCartRelations` using Drizzle `relations()` pointing to `orderTable` and `cartTable`
- [ ] `link-modules/definitions/order-promotion.ts` defines `orderPromotionLink` pgTable (id, order_id, promotion_id, created_at) + `orderPromotionRelations` using Drizzle `relations()` pointing to `orderTable` and `promotionTable`
- [ ] `link-modules/definitions/readonly/cart-customer.ts` defines `cartCustomerRelations` — `relations()` only, traverses `cartTable.customer_id` to `customerTable.id`
- [ ] `link-modules/definitions/readonly/order-customer.ts` defines `orderCustomerRelations` — `relations()` only, traverses `orderTable.customer_id` to `customerTable.id`
- [ ] `link-modules/definitions/index.ts` and `link-modules/definitions/readonly/index.ts` re-export all definitions
- [ ] `link-modules/drizzle.config.ts` points to writable link table definitions, outputs to `link-modules/migrations/`
- [ ] Link table IDs use SQL-level prefixed generation (e.g., `ordcart_`, `ordpromo_`)
- [ ] Writable link tables have NO `.references()` — cross-module columns are plain text (matching the architectural decision)
- [ ] `relations()` definitions appear ONLY in link-modules — no Drizzle relational API within modules
