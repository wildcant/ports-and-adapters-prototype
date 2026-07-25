import { sql } from 'drizzle-orm'
import { index, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'
import { cartLineItemTable } from './line-item.js'

export const cartLineItemTaxLineTable = pgTable(
  'cart_line_item_tax_line',
  {
    id: text().primaryKey().default(sql`CONCAT('calitxl_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    itemId: text()
      .notNull()
      .references(() => cartLineItemTable.id, { onDelete: 'cascade' }),
    code: text().notNull(),
    rate: real().notNull(),
    description: text(),
    providerId: text(),
    taxRateId: text(),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    index('idx_cart_line_item_tax_line_item_id').on(table.itemId).where(sql`deleted_at IS NULL`),
    index('idx_cart_line_item_tax_line_tax_rate_id')
      .on(table.taxRateId)
      .where(sql`deleted_at IS NULL AND tax_rate_id IS NOT NULL`),
  ],
)

export type CartLineItemTaxLine = typeof cartLineItemTaxLineTable.$inferSelect
export type CreateCartLineItemTaxLine = typeof cartLineItemTaxLineTable.$inferInsert
