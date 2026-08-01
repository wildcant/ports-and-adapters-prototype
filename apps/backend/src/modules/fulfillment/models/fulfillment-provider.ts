import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const fulfillmentProviderTable = pgTable('fulfillment_provider', {
  id: text().primaryKey(),
  isEnabled: boolean().notNull().default(true),
  ...timestamps,
})

export type FulfillmentProvider = typeof fulfillmentProviderTable.$inferSelect
export type CreateFulfillmentProvider = typeof fulfillmentProviderTable.$inferInsert
