import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: text().primaryKey().default(sql`CONCAT('usr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  email: text().notNull().unique(),
  name: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
})

export type User = typeof userTable.$inferSelect
export type CreateUser = typeof userTable.$inferInsert
