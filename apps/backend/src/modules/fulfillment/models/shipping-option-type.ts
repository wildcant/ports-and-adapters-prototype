import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const shippingOptionTypeTable = pgTable('shipping_option_type', {
  id: text().primaryKey().default(sql`CONCAT('sotype_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  label: text().notNull(),
  description: text(),
  code: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
})

export type ShippingOptionType = typeof shippingOptionTypeTable.$inferSelect
export type CreateShippingOptionType = typeof shippingOptionTypeTable.$inferInsert
