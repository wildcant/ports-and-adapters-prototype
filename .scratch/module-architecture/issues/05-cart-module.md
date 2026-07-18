# 05 — Cart module

**What to build:** A cart module that manages shopping sessions. The Cart model has a cross-module reference to customer (`customer_id` as plain text, no `.references()`). CartItem has a cross-module reference to inventory (`inventory_item_id` as plain text). CartItem references Cart via intra-module `.references()`. The CartModuleService provides operations for the future checkout workflow — creating carts, adding/removing items, and completing a cart (setting status to completed).

**Blocked by:** 01 — Core infrastructure + Customer module

**Status:** ready-for-agent

- [ ] `modules/cart/models/cart.ts` defines `cartTable` with: prefixed ID (`cart_`), `customer_id` (plain text, cross-module), `status` (active/completed/abandoned), `created_at`, `deleted_at`
- [ ] `modules/cart/models/cart-item.ts` defines `cartItemTable` with: prefixed ID (`cartitem_`), `cart_id` with `.references(() => cartTable.id)` (intra-module FK), `inventory_item_id` (plain text, cross-module), `title`, `quantity` (integer), `unit_price` (integer, cents), `created_at`, `deleted_at`
- [ ] `modules/cart/repositories/cart.ts` extends `BaseRepository`
- [ ] `modules/cart/repositories/cart-item.ts` extends `BaseRepository`, adds `findByCartId` with explicit join or filtered query
- [ ] `modules/cart/services/cart-module-service.ts` implements `ICartModuleService` with: `createCart`, `retrieveCart`, `addLineItem`, `removeLineItem`, `listLineItems(cartId)`, `completeCart(cartId)` (sets status to completed)
- [ ] `completeCart` validates cart is in `active` status before completing
- [ ] `core/types/cart/` has `common.ts` (CartDTO, CartItemDTO), `mutations.ts`, `service.ts`
- [ ] `modules/cart/index.ts` uses `Module(Modules.CART, { ... })` with explicit repository keys for both repos
- [ ] `modules/cart/drizzle.config.ts` configured for per-module migrations
- [ ] `container.resolve(Modules.CART)` returns a working `CartModuleService`
