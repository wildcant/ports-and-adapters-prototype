import { and, eq, isNull } from 'drizzle-orm'
import type { Context } from '../../../core/types/context.js'
import { BaseRepository } from '../../../core/utils/base-repository.js'
import { inventoryItemTable } from '../models/inventory-item.js'

export class InventoryItemRepository extends BaseRepository(inventoryItemTable) {
  async findBySku(sku: string, context?: Context) {
    const client = this.getClient(context)
    const rows = await client
      .select()
      .from(this.table)
      .where(and(eq(this.table.sku, sku), isNull(this.table.deletedAt)))
    return rows[0] ?? null
  }
}
