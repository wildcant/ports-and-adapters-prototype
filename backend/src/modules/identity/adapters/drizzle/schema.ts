/**
 * Drizzle schema definition for the identity module.
 * drizzle-kit reads this file to generate migrations.
 */

import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  created_at: text('created_at').notNull(),
})
