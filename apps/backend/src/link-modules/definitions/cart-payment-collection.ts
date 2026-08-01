import { sql } from 'drizzle-orm'
import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { timestamps } from '../../core/db/columns.js'

export const cartPaymentCollectionTable = pgTable(
  'cart_payment_collection',
  {
    id: text().primaryKey().default(sql`CONCAT('cartpaycol_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    cartId: text().notNull(),
    paymentCollectionId: text().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('idx_cart_payment_collection')
      .on(table.cartId, table.paymentCollectionId)
      .where(sql`deleted_at IS NULL`),
  ],
)

export type CartPaymentCollection = typeof cartPaymentCollectionTable.$inferSelect
export type CreateCartPaymentCollection = typeof cartPaymentCollectionTable.$inferInsert
