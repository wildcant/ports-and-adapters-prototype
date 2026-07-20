# 04 — Promotion module

**What to build:** A promotion module that manages discount codes. The module follows the established pattern: class-based service, BaseRepository extension, Module() factory, per-module drizzle config. The PromotionModuleService provides operations for creating promotions and validating them for use in the future checkout workflow — checking that a promotion exists, is active, and falls within its validity date range.

**Blocked by:** 01 — Core infrastructure + Customer module

**Status:** ready-for-agent

- [ ] `modules/promotion/models/promotion.ts` defines `promotionTable` with: prefixed ID (`promo_`), `code` (unique), `discount_type` (percentage or fixed), `discount_value` (integer), `is_active` (boolean), `starts_at` (timestamp), `ends_at` (timestamp), `created_at`, `deleted_at`
- [ ] `modules/promotion/repositories/promotion.ts` extends `BaseRepository`, adds `findByCode` custom query
- [ ] `modules/promotion/services/promotion-module-service.ts` implements `IPromotionModuleService` with: `listPromotions`, `retrievePromotion`, `createPromotion`, `updatePromotion`, `deletePromotion`, `validatePromotion(code)` (checks active + date range, returns PromotionDTO or throws)
- [ ] `core/types/promotion/` has `common.ts`, `mutations.ts`, `service.ts`
- [ ] `modules/promotion/index.ts` uses `Module(Modules.PROMOTION, { ... })` with explicit repository keys
- [ ] `modules/promotion/drizzle.config.ts` configured for per-module migrations
- [ ] `container.resolve(Modules.PROMOTION)` returns a working `PromotionModuleService`
