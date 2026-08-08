import { sql } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const inviteTable = pgTable(
  'invite',
  {
    id: text().primaryKey().default(sql`CONCAT('invite_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    email: text().notNull(),
    accepted: boolean().notNull().default(false),
    token: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    // TODO(RBAC): roles when RBAC is implemented
    ...timestamps,
  },
  (table) => [
    uniqueIndex('idx_invite_email').on(table.email).where(sql`deleted_at IS NULL`),
    index('idx_invite_token').on(table.token).where(sql`deleted_at IS NULL`),
  ],
)

export type Invite = typeof inviteTable.$inferSelect
export type CreateInvite = typeof inviteTable.$inferInsert
