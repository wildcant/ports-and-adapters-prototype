import { sql } from 'drizzle-orm'
import { jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const accountHolderTable = pgTable(
  'account_holder',
  {
    id: text().primaryKey().default(sql`CONCAT('acchld_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    data: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    email: text(),
    externalId: text().notNull(),
    metadata: jsonb().$type<Record<string, unknown> | null>(),
    providerId: text().notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    uniqueIndex('idx_account_holder_provider_external')
      .on(table.providerId, table.externalId)
      .where(sql`deleted_at IS NULL`),
  ],
)

export type AccountHolder = typeof accountHolderTable.$inferSelect
export type CreateAccountHolder = typeof accountHolderTable.$inferInsert
