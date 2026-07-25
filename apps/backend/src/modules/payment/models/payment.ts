import { sql } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { paymentCollectionTable } from './payment-collection.js'
import { paymentSessionTable } from './payment-session.js'

export const paymentTable = pgTable(
  'payment',
  {
    id: text().primaryKey().default(sql`CONCAT('pay_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    amount: integer().notNull(),
    canceledAt: timestamp(),
    capturedAt: timestamp(),
    currencyCode: text().notNull(),
    data: jsonb().$type<Record<string, unknown> | null>(),
    metadata: jsonb().$type<Record<string, unknown> | null>(),
    paymentCollectionId: text()
      .notNull()
      .references(() => paymentCollectionTable.id),
    paymentSessionId: text()
      .notNull()
      .references(() => paymentSessionTable.id),
    providerId: text().notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [
    index('idx_payment_provider_id').on(table.providerId).where(sql`deleted_at IS NULL`),
    index('idx_payment_collection_id').on(table.paymentCollectionId).where(sql`deleted_at IS NULL`),
    index('idx_payment_session_id').on(table.paymentSessionId).where(sql`deleted_at IS NULL`),
  ],
)

export type Payment = typeof paymentTable.$inferSelect
export type CreatePayment = typeof paymentTable.$inferInsert
