import { sql } from 'drizzle-orm'
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { fulfillmentTable } from './fulfillment.js'

export const fulfillmentAddressTable = pgTable(
  'fulfillment_address',
  {
    id: text().primaryKey().default(sql`CONCAT('fuladdr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    fulfillmentId: text()
      .notNull()
      .references(() => fulfillmentTable.id, { onDelete: 'cascade' }),
    company: text(),
    firstName: text(),
    lastName: text(),
    address1: text('address_1'),
    address2: text('address_2'),
    city: text(),
    countryCode: text(),
    province: text(),
    postalCode: text(),
    phone: text(),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [index('idx_fulfillment_address_fulfillment_id').on(table.fulfillmentId).where(sql`deleted_at IS NULL`)],
)

export type FulfillmentAddress = typeof fulfillmentAddressTable.$inferSelect
export type CreateFulfillmentAddress = typeof fulfillmentAddressTable.$inferInsert
