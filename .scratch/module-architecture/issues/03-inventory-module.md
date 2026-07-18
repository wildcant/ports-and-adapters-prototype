# 03 — Inventory module

**What to build:** An inventory module that tracks products and stock levels. The module follows the established pattern from ticket 01: class-based service, BaseRepository extension, Module() factory, per-module drizzle config. The InventoryModuleService provides stock management operations needed by the future checkout workflow — retrieving items, checking availability, reserving stock (decrementing quantity), and releasing stock (incrementing quantity). These stock operations use `withTransaction` for atomicity.

**Blocked by:** 01 — Core infrastructure + Customer module

**Status:** ready-for-agent

- [ ] `modules/inventory/models/inventory-item.ts` defines `inventoryItemTable` with: prefixed ID (`inv_`), `sku`, `title`, `description`, `price_amount` (integer, cents), `stock_quantity` (integer), `created_at`, `deleted_at`
- [ ] `modules/inventory/repositories/inventory-item.ts` extends `BaseRepository`, adds custom queries as needed (e.g., `findBySku`)
- [ ] `modules/inventory/services/inventory-module-service.ts` implements `IInventoryModuleService` with: `listInventoryItems`, `retrieveInventoryItem`, `createInventoryItem`, `updateInventoryItem`, `deleteInventoryItem`, `reserveStock(itemId, quantity)`, `releaseStock(itemId, quantity)`
- [ ] `reserveStock` validates sufficient quantity before decrementing, throws if insufficient
- [ ] `releaseStock` increments quantity (used for compensation/rollback in future workflows)
- [ ] `core/types/inventory/` has `common.ts`, `mutations.ts`, `service.ts`
- [ ] `modules/inventory/index.ts` uses `Module(Modules.INVENTORY, { ... })` with explicit repository keys
- [ ] `modules/inventory/drizzle.config.ts` configured for per-module migrations
- [ ] `container.resolve(Modules.INVENTORY)` returns a working `InventoryModuleService`
