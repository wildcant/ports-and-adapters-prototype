import { sql } from 'drizzle-orm'
import { jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const authIdentityTable = pgTable('auth_identity', {
  id: text().primaryKey().default(sql`CONCAT('authid_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  appMetadata: jsonb().$type<Record<string, unknown> | null>(),
  ...timestamps,
})

export type AuthIdentity = typeof authIdentityTable.$inferSelect
export type CreateAuthIdentity = typeof authIdentityTable.$inferInsert
