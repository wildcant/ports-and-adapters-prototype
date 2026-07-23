import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { inventoryItemTable } from './inventory-item.js'

export const reservationItemTable = pgTable(
  'reservation_item',
  {
    id: text().primaryKey().default(sql`CONCAT('resitem_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    inventoryItemId: text()
      .notNull()
      .references(() => inventoryItemTable.id, { onDelete: 'cascade' }),
    locationId: text().notNull(),
    quantity: integer().notNull(),
    lineItemId: text(),
    allowBackorder: boolean().default(false).notNull(),
    externalId: text(),
    description: text(),
    createdBy: text(),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    index('idx_reservation_item_inventory_item_id').on(table.inventoryItemId),
    index('idx_reservation_item_location_id').on(table.locationId),
    index('idx_reservation_item_line_item_id').on(table.lineItemId),
  ],
)

export type ReservationItem = typeof reservationItemTable.$inferSelect
export type CreateReservationItem = typeof reservationItemTable.$inferInsert
