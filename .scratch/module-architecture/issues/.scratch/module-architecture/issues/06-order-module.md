# 06 — Order module

**What to build:** An order module that represents confirmed purchases. The Order model has a cross-module reference to customer (`customer_id` as plain text). OrderItem has a cross-module reference to inventory (`inventory_item_id` as plain text). OrderItem references Order via intra-module `.references()`. The OrderModuleService provides operations for the future checkout workflow — creating orders from cart data, cancelling orders, and managing order status transitions.

**Blocked by:** 01 — Core infrastructure + Customer module

**Status:** ready-for-agent

- [ ] `modules/order/models/order.ts` defines `orderTable` with: prefixed ID (`ord_`), `customer_id` (plain text, cross-module), `status` (pending/confirmed/shipped/delivered/cancelled), `total_amount` (integer, cents), `currency` (text, default "usd"), `created_at`, `deleted_at`
- [ ] `modules/order/models/order-item.ts` defines `orderItemTable` with: prefixed ID (`orditem_`), `order_id` with `.references(() => orderTable.id)` (intra-module FK), `inventory_item_id` (plain text, cross-module), `title`, `quantity` (integer), `unit_price` (integer, cents), `created_at`, `deleted_at`
- [ ] `modules/order/repositories/order.ts` extends `BaseRepository`, adds `findWithItems` using explicit Drizzle join
- [ ] `modules/order/repositories/order-item.ts` extends `BaseRepository`, adds `findByOrderId`
- [ ] `modules/order/services/order-module-service.ts` implements `IOrderModuleService` with: `createOrder` (creates order + items in one transaction via `withTransaction`), `retrieveOrder`, `listOrders`, `cancelOrder` (validates status, soft-deletes items, sets status to cancelled)
- [ ] `core/types/order/` has `common.ts` (OrderDTO, OrderItemDTO), `mutations.ts` (CreateOrderDTO with nested items), `service.ts`
- [ ] `modules/order/index.ts` uses `Module(Modules.ORDER, { ... })` with explicit repository keys for both repos
- [ ] `modules/order/drizzle.config.ts` configured for per-module migrations
- [ ] `container.resolve(Modules.ORDER)` returns a working `OrderModuleService`
