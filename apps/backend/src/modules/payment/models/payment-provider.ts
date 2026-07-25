import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const paymentProviderTable = pgTable('payment_provider', {
  id: text().primaryKey(),
  isEnabled: boolean().notNull().default(true),
  deletedAt: timestamp(),
})

export type PaymentProvider = typeof paymentProviderTable.$inferSelect
export type CreatePaymentProvider = typeof paymentProviderTable.$inferInsert
