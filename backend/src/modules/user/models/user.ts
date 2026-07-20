import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: text('id').primaryKey().default(sql`CONCAT('usr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

export type User = typeof userTable.$inferSelect
export type CreateUser = typeof userTable.$inferInsert
