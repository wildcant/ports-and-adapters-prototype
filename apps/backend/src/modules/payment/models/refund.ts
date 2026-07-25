import { sql } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { paymentTable } from './payment.js'
import { refundReasonTable } from './refund-reason.js'

export const refundTable = pgTable(
  'refund',
  {
    id: text().primaryKey().default(sql`CONCAT('ref_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    amount: integer().notNull(),
    createdBy: text(),
    metadata: jsonb().$type<Record<string, unknown> | null>(),
    note: text(),
    paymentId: text()
      .notNull()
      .references(() => paymentTable.id),
    refundReasonId: text().references(() => refundReasonTable.id),

    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [index('idx_refund_payment_id').on(table.paymentId).where(sql`deleted_at IS NULL`)],
)

export type Refund = typeof refundTable.$inferSelect
export type CreateRefund = typeof refundTable.$inferInsert
