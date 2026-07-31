import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const shippingProfileTable = pgTable('shipping_profile', {
  id: text().primaryKey().default(sql`CONCAT('sp_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  name: text().notNull(),
  type: text().notNull(),
  metadata: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
})

export type ShippingProfile = typeof shippingProfileTable.$inferSelect
export type CreateShippingProfile = typeof shippingProfileTable.$inferInsert
