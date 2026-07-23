import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const cartAddressTable = pgTable('cart_address', {
  id: text().primaryKey().default(sql`CONCAT('caaddr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  customerId: text(),
  company: text(),
  firstName: text(),
  lastName: text(),
  address1: text('address_1'),
  address2: text('address_2'),
  city: text(),
  countryCode: text(),
  province: text(),
  postalCode: text(),
  phone: text(),
  metadata: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
})

export type CartAddress = typeof cartAddressTable.$inferSelect
export type CreateCartAddress = typeof cartAddressTable.$inferInsert
