import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const paymentProviderTable = pgTable('payment_provider', {
  id: text().primaryKey(),
  isEnabled: boolean().notNull().default(true),
  ...timestamps,
})

export type PaymentProvider = typeof paymentProviderTable.$inferSelect
export type CreatePaymentProvider = typeof paymentProviderTable.$inferInsert
