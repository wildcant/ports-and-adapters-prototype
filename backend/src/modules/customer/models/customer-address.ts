import { sql } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { customerTable } from './customer.js'

export const customerAddressTable = pgTable(
  'customer_address',
  {
    id: text().primaryKey().default(sql`CONCAT('cuaddr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    customerId: text()
      .notNull()
      .references(() => customerTable.id, { onDelete: 'cascade' }),
    addressName: text(),
    isDefaultShipping: boolean().default(false).notNull(),
    isDefaultBilling: boolean().default(false).notNull(),
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
  },
  (table) => [
    index('idx_customer_address_customer_id').on(table.customerId),
    uniqueIndex('idx_customer_address_unique_customer_billing')
      .on(table.customerId)
      .where(sql`is_default_billing = true`),
    uniqueIndex('idx_customer_address_unique_customer_shipping')
      .on(table.customerId)
      .where(sql`is_default_shipping = true`),
  ],
)

export type CustomerAddress = typeof customerAddressTable.$inferSelect
export type CreateCustomerAddress = typeof customerAddressTable.$inferInsert
