import { sql } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const shippingOptionTypeTable = pgTable('shipping_option_type', {
  id: text().primaryKey().default(sql`CONCAT('sotype_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  label: text().notNull(),
  description: text(),
  code: text().notNull(),
  ...timestamps,
})

export type ShippingOptionType = typeof shippingOptionTypeTable.$inferSelect
export type CreateShippingOptionType = typeof shippingOptionTypeTable.$inferInsert
