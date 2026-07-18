import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive'])

export const customerTable = pgTable('customer', {
  id: text('id').primaryKey().default(sql`CONCAT('cus_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  status: customerStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

export type Customer = typeof customerTable.$inferSelect
export type CreateCustomer = typeof customerTable.$inferInsert
