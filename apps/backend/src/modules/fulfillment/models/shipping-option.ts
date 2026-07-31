import { sql } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { serviceZoneTable } from './service-zone.js'
import { shippingOptionTypeTable } from './shipping-option-type.js'
import { shippingProfileTable } from './shipping-profile.js'

export const shippingOptionTable = pgTable(
  'shipping_option',
  {
    id: text().primaryKey().default(sql`CONCAT('so_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    name: text().notNull(),
    priceType: text().notNull(),
    amount: integer(),
    serviceZoneId: text()
      .notNull()
      .references(() => serviceZoneTable.id),
    shippingProfileId: text()
      .notNull()
      .references(() => shippingProfileTable.id),
    shippingOptionTypeId: text().references(() => shippingOptionTypeTable.id),
    providerId: text().notNull(),
    data: jsonb(),
    metadata: text(),
    isEnabled: boolean().default(true).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    index('idx_shipping_option_service_zone_id').on(table.serviceZoneId).where(sql`deleted_at IS NULL`),
    index('idx_shipping_option_provider_id').on(table.providerId).where(sql`deleted_at IS NULL`),
    index('idx_shipping_option_profile_id').on(table.shippingProfileId).where(sql`deleted_at IS NULL`),
  ],
)

export type ShippingOption = typeof shippingOptionTable.$inferSelect
export type CreateShippingOption = typeof shippingOptionTable.$inferInsert
