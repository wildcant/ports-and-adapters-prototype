// Link-owned tables

// Re-export module tables referenced by link definitions.
// This is the ONE place cross-module table imports are allowed —
// consumers (repos, drizzle schema config) import from here, never from modules directly.
export { cartLineItemTable } from '../../modules/cart/models/line-item.js'
export { inventoryItemTable } from '../../modules/inventory/models/inventory-item.js'
export { inventoryLevelTable } from '../../modules/inventory/models/inventory-level.js'
export { productTable } from '../../modules/product/models/product.js'
export { productVariantTable } from '../../modules/product/models/product-variant.js'
export type {
  CreateProductVariantInventoryItem,
  ProductVariantInventoryItem,
} from './product-variant-inventory-item.js'
export {
  productVariantInventoryItemRelations,
  productVariantInventoryItemTable,
} from './product-variant-inventory-item.js'
// Readonly link relations (cross-module join declarations)
export { cartLineItemProductRelations } from './readonly/index.js'
