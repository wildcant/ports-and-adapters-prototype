import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'
import { cartTable } from './cart.js'

export const cartShippingMethodTable = pgTable(
  'cart_shipping_method',
  {
    id: text().primaryKey().default(sql`CONCAT('casm_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    cartId: text()
      .notNull()
      .references(() => cartTable.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    description: text(),
    amount: integer().notNull(),
    isTaxInclusive: boolean().default(false).notNull(),
    shippingOptionId: text(),
    data: text(),
    metadata: text(),
    ...timestamps,
  },
  (table) => [
    index('idx_cart_shipping_method_cart_id').on(table.cartId).where(sql`deleted_at IS NULL`),
    index('idx_cart_shipping_method_option_id')
      .on(table.shippingOptionId)
      .where(sql`deleted_at IS NULL AND shipping_option_id IS NOT NULL`),
  ],
)

export type CartShippingMethod = typeof cartShippingMethodTable.$inferSelect
export type CreateCartShippingMethod = typeof cartShippingMethodTable.$inferInsert
