import { sql } from 'drizzle-orm'
import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'
import { productTable } from './product.js'

export const productOptionTable = pgTable(
  'product_option',
  {
    id: text().primaryKey().default(sql`CONCAT('opt_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    productId: text()
      .notNull()
      .references(() => productTable.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    metadata: text(),
    ...timestamps,
  },
  (table) => [index('idx_product_option_product_id').on(table.productId)],
)

export type ProductOption = typeof productOptionTable.$inferSelect
export type CreateProductOption = typeof productOptionTable.$inferInsert
