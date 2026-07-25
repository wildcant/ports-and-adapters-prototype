import { sql } from 'drizzle-orm'
import { index, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const paymentCollectionStatusEnum = pgEnum('payment_collection_status', [
  'not_paid',
  'awaiting',
  'authorized',
  'partially_authorized',
  'completed',
])

export const paymentCollectionTable = pgTable(
  'payment_collection',
  {
    id: text().primaryKey().default(sql`CONCAT('pay_col_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    amount: integer().notNull(),
    authorizedAmount: integer(),
    capturedAmount: integer(),
    completedAt: timestamp(),
    currencyCode: text().notNull().default('usd'),
    metadata: jsonb().$type<Record<string, unknown> | null>(),
    refundedAmount: integer(),
    status: paymentCollectionStatusEnum().notNull().default('not_paid'),

    deletedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index('idx_payment_collection_status').on(table.status).where(sql`deleted_at IS NULL`)],
)

export type PaymentCollection = typeof paymentCollectionTable.$inferSelect
export type CreatePaymentCollection = typeof paymentCollectionTable.$inferInsert
