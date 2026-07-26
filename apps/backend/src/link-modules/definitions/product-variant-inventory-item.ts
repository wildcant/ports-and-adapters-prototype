import { relations, sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { inventoryItemTable, productVariantTable } from '../definitions/index.js'

export const productVariantInventoryItemTable = pgTable(
  'product_variant_inventory_item',
  {
    id: text().primaryKey().default(sql`CONCAT('pvitem_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    variantId: text().notNull(),
    inventoryItemId: text().notNull(),
    requiredQuantity: integer().notNull().default(1),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    uniqueIndex('idx_pvitem_variant_inventory')
      .on(table.variantId, table.inventoryItemId)
      .where(sql`deleted_at IS NULL`),
    index('idx_pvitem_variant_id').on(table.variantId).where(sql`deleted_at IS NULL`),
    index('idx_pvitem_inventory_item_id').on(table.inventoryItemId).where(sql`deleted_at IS NULL`),
  ],
)

export const productVariantInventoryItemRelations = relations(productVariantInventoryItemTable, ({ one }) => ({
  variant: one(productVariantTable, {
    fields: [productVariantInventoryItemTable.variantId],
    references: [productVariantTable.id],
  }),
  inventoryItem: one(inventoryItemTable, {
    fields: [productVariantInventoryItemTable.inventoryItemId],
    references: [inventoryItemTable.id],
  }),
}))

export type ProductVariantInventoryItem = typeof productVariantInventoryItemTable.$inferSelect
export type CreateProductVariantInventoryItem = typeof productVariantInventoryItemTable.$inferInsert
