import { sql } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { customerTable } from './customer.js'

export const customerAddressTable = pgTable(
  'customer_address',
  {
    id: text('id').primaryKey().default(sql`CONCAT('cuaddr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    customer_id: text('customer_id')
      .notNull()
      .references(() => customerTable.id, { onDelete: 'cascade' }),
    address_name: text('address_name'),
    is_default_shipping: boolean('is_default_shipping').default(false).notNull(),
    is_default_billing: boolean('is_default_billing').default(false).notNull(),
    company: text('company'),
    first_name: text('first_name'),
    last_name: text('last_name'),
    address_1: text('address_1'),
    address_2: text('address_2'),
    city: text('city'),
    country_code: text('country_code'),
    province: text('province'),
    postal_code: text('postal_code'),
    phone: text('phone'),
    metadata: text('metadata'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_customer_address_customer_id').on(table.customer_id),
    uniqueIndex('idx_customer_address_unique_customer_billing')
      .on(table.customer_id)
      .where(sql`is_default_billing = true`),
    uniqueIndex('idx_customer_address_unique_customer_shipping')
      .on(table.customer_id)
      .where(sql`is_default_shipping = true`),
  ],
)

export type CustomerAddress = typeof customerAddressTable.$inferSelect
export type CreateCustomerAddress = typeof customerAddressTable.$inferInsert
