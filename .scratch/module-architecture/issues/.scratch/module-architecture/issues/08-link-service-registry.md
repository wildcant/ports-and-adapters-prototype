# 08 — Link Service Registry

**What to build:** Replace the current `LinkModuleService` (one-service-per-link via `Module()` + `bootstrapModule()`) with a single `LinkService` that acts as a typed repository registry. Writable link repos extend `BaseRepository` for generic CRUD plus escape-hatch query methods. Readonly link repos are lightweight classes with only read methods for cross-module joins via existing FK columns. A `linkService.repo(name)` accessor returns the correctly-typed repository. Add a `CartProductRepository` as the first readonly repo for the cart-product link. The existing `ProductVariantInventoryItemRepository` stays as-is — it was the service wrapper that was the problem, not the repo.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `LinkRepositoryMap` type maps link name strings to concrete repository types (one line per link: `productVariantInventoryItem` writable, `cartProduct` readonly)
- [ ] `LinkService` class holds all link repositories, exposes `repo<K>(name: K): LinkRepositoryMap[K]` with full type safety and autocomplete
- [ ] `LinkService` is registered once in the shared DI container (not via `Module()` / `bootstrapModule()` — simpler direct registration)
- [ ] `CartProductRepository` readonly repo provides read methods that join `cart_line_item` with `product_variant` and `product` tables via existing FK columns (no `BaseRepository`, no write methods)
- [ ] `ProductVariantInventoryItemRepository` continues to extend `BaseRepository` with its existing `getInventoryAvailability()` escape-hatch method — no changes needed
- [ ] `LinkModuleService` deleted — all callers migrate to `linkService.repo(name)` pattern
- [ ] `link-modules/index.ts` refactored to register `LinkService` instead of the old module pattern
- [ ] Link table definitions, relations, and migrations are unchanged
- [ ] Typechecks pass
