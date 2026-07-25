import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const cartPaymentCollectionTable = pgTable(
  'cart_payment_collection',
  {
    id: text().primaryKey().default(sql`CONCAT('cartpaycol_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    cartId: text().notNull(),
    paymentCollectionId: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    uniqueIndex('idx_cart_payment_collection')
      .on(table.cartId, table.paymentCollectionId)
      .where(sql`deleted_at IS NULL`),
  ],
)

export type CartPaymentCollection = typeof cartPaymentCollectionTable.$inferSelect
export type CreateCartPaymentCollection = typeof cartPaymentCollectionTable.$inferInsert
