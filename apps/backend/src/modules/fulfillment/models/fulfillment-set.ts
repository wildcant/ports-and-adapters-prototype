import { sql } from 'drizzle-orm'
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const fulfillmentSetTable = pgTable(
  'fulfillment_set',
  {
    id: text().primaryKey().default(sql`CONCAT('fuset_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    name: text().notNull(),
    type: text().notNull(),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [index('idx_fulfillment_set_type').on(table.type).where(sql`deleted_at IS NULL`)],
)

export type FulfillmentSet = typeof fulfillmentSetTable.$inferSelect
export type CreateFulfillmentSet = typeof fulfillmentSetTable.$inferInsert
