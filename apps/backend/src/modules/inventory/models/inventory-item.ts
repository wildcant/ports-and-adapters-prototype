import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const inventoryItemTable = pgTable(
  'inventory_item',
  {
    id: text().primaryKey().default(sql`CONCAT('iitem_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    sku: text(),
    originCountry: text(),
    hsCode: text(),
    midCode: text(),
    material: text(),
    weight: integer(),
    length: integer(),
    height: integer(),
    width: integer(),
    requiresShipping: boolean().default(true).notNull(),
    description: text(),
    title: text(),
    thumbnail: text(),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [uniqueIndex('idx_inventory_item_sku').on(table.sku).where(sql`deleted_at IS NULL`)],
)

export type InventoryItem = typeof inventoryItemTable.$inferSelect
export type CreateInventoryItem = typeof inventoryItemTable.$inferInsert
