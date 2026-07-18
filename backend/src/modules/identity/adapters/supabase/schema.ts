/**
 * Drizzle schema definition for the identity module (Postgres/Supabase).
 * drizzle-kit reads this file to generate migrations.
 */

import { pgTable, text } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  created_at: text('created_at').notNull(),
})
