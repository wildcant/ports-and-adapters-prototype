import { sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { productOptionTable } from './product-option.js'

export const productOptionValueTable = pgTable(
  'product_option_value',
  {
    id: text().primaryKey().default(sql`CONCAT('optval_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    optionId: text()
      .notNull()
      .references(() => productOptionTable.id, { onDelete: 'cascade' }),
    value: text().notNull(),
    rank: integer().default(0),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    index('idx_product_option_value_option_id').on(table.optionId),
    uniqueIndex('idx_product_option_value_option_id_value')
      .on(table.optionId, table.value)
      .where(sql`deleted_at IS NULL`),
  ],
)

export type ProductOptionValue = typeof productOptionValueTable.$inferSelect
export type CreateProductOptionValue = typeof productOptionValueTable.$inferInsert
