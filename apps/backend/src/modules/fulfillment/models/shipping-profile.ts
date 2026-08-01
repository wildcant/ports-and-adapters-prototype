import { sql } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const shippingProfileTable = pgTable('shipping_profile', {
  id: text().primaryKey().default(sql`CONCAT('sp_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  name: text().notNull(),
  type: text().notNull(),
  metadata: text(),
  ...timestamps,
})

export type ShippingProfile = typeof shippingProfileTable.$inferSelect
export type CreateShippingProfile = typeof shippingProfileTable.$inferInsert
