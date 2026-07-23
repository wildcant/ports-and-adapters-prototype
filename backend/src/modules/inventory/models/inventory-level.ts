import { sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { inventoryItemTable } from './inventory-item.js'

export const inventoryLevelTable = pgTable(
  'inventory_level',
  {
    id: text().primaryKey().default(sql`CONCAT('ilev_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    inventoryItemId: text()
      .notNull()
      .references(() => inventoryItemTable.id, { onDelete: 'cascade' }),
    locationId: text().notNull(),
    stockedQuantity: integer().notNull().default(0),
    reservedQuantity: integer().notNull().default(0),
    incomingQuantity: integer().notNull().default(0),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    uniqueIndex('idx_inventory_level_item_location')
      .on(table.inventoryItemId, table.locationId)
      .where(sql`deleted_at IS NULL`),
    index('idx_inventory_level_inventory_item_id').on(table.inventoryItemId),
    index('idx_inventory_level_location_id').on(table.locationId),
  ],
)

export type InventoryLevel = typeof inventoryLevelTable.$inferSelect
export type CreateInventoryLevel = typeof inventoryLevelTable.$inferInsert
