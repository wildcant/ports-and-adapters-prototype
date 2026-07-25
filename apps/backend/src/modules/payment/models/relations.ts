import { relations } from 'drizzle-orm'
import { captureTable } from './capture.js'
import { paymentTable } from './payment.js'
import { paymentCollectionTable } from './payment-collection.js'
import { paymentSessionTable } from './payment-session.js'
import { refundTable } from './refund.js'
import { refundReasonTable } from './refund-reason.js'

export const paymentCollectionRelations = relations(paymentCollectionTable, ({ many }) => ({
  paymentSessions: many(paymentSessionTable),
  payments: many(paymentTable),
}))

export const paymentSessionRelations = relations(paymentSessionTable, ({ one }) => ({
  paymentCollection: one(paymentCollectionTable, {
    fields: [paymentSessionTable.paymentCollectionId],
    references: [paymentCollectionTable.id],
  }),
}))

export const paymentRelations = relations(paymentTable, ({ one, many }) => ({
  paymentCollection: one(paymentCollectionTable, {
    fields: [paymentTable.paymentCollectionId],
    references: [paymentCollectionTable.id],
  }),
  paymentSession: one(paymentSessionTable, {
    fields: [paymentTable.paymentSessionId],
    references: [paymentSessionTable.id],
  }),
  captures: many(captureTable),
  refunds: many(refundTable),
}))

export const captureRelations = relations(captureTable, ({ one }) => ({
  payment: one(paymentTable, {
    fields: [captureTable.paymentId],
    references: [paymentTable.id],
  }),
}))

export const refundRelations = relations(refundTable, ({ one }) => ({
  payment: one(paymentTable, {
    fields: [refundTable.paymentId],
    references: [paymentTable.id],
  }),
  refundReason: one(refundReasonTable, {
    fields: [refundTable.refundReasonId],
    references: [refundReasonTable.id],
  }),
}))
