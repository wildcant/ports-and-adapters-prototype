import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive'])

export const customerTable = pgTable('customer', {
  id: text().primaryKey().default(sql`CONCAT('cus_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  firstName: text().notNull(),
  lastName: text().notNull(),
  email: text().notNull().unique(),
  status: customerStatusEnum().default('active').notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
})

export type Customer = typeof customerTable.$inferSelect
export type CreateCustomer = typeof customerTable.$inferInsert
