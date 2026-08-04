import { sql } from 'drizzle-orm'
import { boolean, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../../../core/db/columns.js'
import { shippingOptionTable } from './shipping-option.js'

export const fulfillmentTable = pgTable(
  'fulfillment',
  {
    id: text().primaryKey().default(sql`CONCAT('ful_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    locationId: text(),
    providerId: text().notNull(),
    shippingOptionId: text().references(() => shippingOptionTable.id),
    data: jsonb(),
    requiresShipping: boolean().default(true).notNull(),
    packedAt: timestamp({ withTimezone: true }),
    shippedAt: timestamp({ withTimezone: true }),
    deliveredAt: timestamp({ withTimezone: true }),
    canceledAt: timestamp({ withTimezone: true }),
    metadata: text(),
    ...timestamps,
  },
  (table) => [
    index('idx_fulfillment_provider_id').on(table.providerId).where(sql`deleted_at IS NULL`),
    index('idx_fulfillment_shipping_option_id')
      .on(table.shippingOptionId)
      .where(sql`deleted_at IS NULL AND shipping_option_id IS NOT NULL`),
  ],
)

export type Fulfillment = typeof fulfillmentTable.$inferSelect
export type CreateFulfillment = typeof fulfillmentTable.$inferInsert
