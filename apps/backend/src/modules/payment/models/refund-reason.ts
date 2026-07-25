import { sql } from 'drizzle-orm'
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const refundReasonTable = pgTable('refund_reason', {
  id: text().primaryKey().default(sql`CONCAT('refr_', REPLACE(gen_random_uuid()::text, '-', ''))`),
  code: text().notNull(),
  description: text(),
  label: text().notNull(),
  metadata: jsonb().$type<Record<string, unknown> | null>(),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
})

export type RefundReason = typeof refundReasonTable.$inferSelect
export type CreateRefundReason = typeof refundReasonTable.$inferInsert
