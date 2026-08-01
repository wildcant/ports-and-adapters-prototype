import { sql } from 'drizzle-orm'
import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'

export const fulfillmentSetTable = pgTable(
  'fulfillment_set',
  {
    id: text().primaryKey().default(sql`CONCAT('fuset_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    name: text().notNull(),
    type: text().notNull(),
    metadata: text(),
    ...timestamps,
  },
  (table) => [index('idx_fulfillment_set_type').on(table.type).where(sql`deleted_at IS NULL`)],
)

export type FulfillmentSet = typeof fulfillmentSetTable.$inferSelect
export type CreateFulfillmentSet = typeof fulfillmentSetTable.$inferInsert
