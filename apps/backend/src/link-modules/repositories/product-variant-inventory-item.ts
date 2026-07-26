import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { Context } from '../../core/types/context.js'
import { BaseRepository } from '../../core/utils/base-repository.js'
import { productVariantInventoryItemTable } from '../definitions/product-variant-inventory-item.js'
import { inventoryLevelTable } from '../modules-definitions.js'

export class ProductVariantInventoryItemRepository extends BaseRepository(productVariantInventoryItemTable) {
  async findByVariantIds(variantIds: string[], context?: Context) {
    if (variantIds.length === 0) return []
    const client = this.getClient(context)
    return client
      .select()
      .from(this.table)
      .where(and(inArray(this.table.variantId, variantIds), isNull(this.table.deletedAt)))
  }

  async getInventoryAvailability(variantIds: string[], context?: Context) {
    if (variantIds.length === 0) return []
    const client = this.getClient(context)
    return client
      .select({
        variantId: this.table.variantId,
        inventoryItemId: this.table.inventoryItemId,
        requiredQuantity: this.table.requiredQuantity,
        locationId: inventoryLevelTable.locationId,
        stockedQuantity: inventoryLevelTable.stockedQuantity,
        reservedQuantity: inventoryLevelTable.reservedQuantity,
      })
      .from(this.table)
      .innerJoin(inventoryLevelTable, eq(this.table.inventoryItemId, inventoryLevelTable.inventoryItemId))
      .where(and(inArray(this.table.variantId, variantIds), isNull(this.table.deletedAt)))
  }
}
