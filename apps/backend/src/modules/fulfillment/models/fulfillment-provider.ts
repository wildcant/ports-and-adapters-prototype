import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const fulfillmentProviderTable = pgTable('fulfillment_provider', {
  id: text().primaryKey(),
  isEnabled: boolean().notNull().default(true),
  deletedAt: timestamp(),
})

export type FulfillmentProvider = typeof fulfillmentProviderTable.$inferSelect
export type CreateFulfillmentProvider = typeof fulfillmentProviderTable.$inferInsert
