import { sql } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const userTable = pgTable('user', {
  id: text().primaryKey().default(sql`CONCAT('usr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  email: text().notNull().unique(),
  name: text().notNull(),
  ...timestamps,
})

export type User = typeof userTable.$inferSelect
export type CreateUser = typeof userTable.$inferInsert
