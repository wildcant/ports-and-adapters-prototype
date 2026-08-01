import { z } from 'zod'

export const AdminPaymentProvider = z
  .object({
    id: z.string(),
    isEnabled: z.boolean(),
  })
  .openapi('AdminPaymentProvider')
export type AdminPaymentProvider = z.infer<typeof AdminPaymentProvider>

export const AdminCapture = z
  .object({
    id: z.string(),
    paymentId: z.string(),
    amount: z.number(),
    createdBy: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.iso.datetime(),
  })
  .openapi('AdminCapture')
export type AdminCapture = z.infer<typeof AdminCapture>

export const AdminRefund = z
  .object({
    id: z.string(),
    paymentId: z.string(),
    refundReasonId: z.string().nullable(),
    amount: z.number(),
    note: z.string().nullable(),
    createdBy: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.iso.datetime(),
  })
  .openapi('AdminRefund')
export type AdminRefund = z.infer<typeof AdminRefund>

export const AdminPayment = z
  .object({
    id: z.string(),
    paymentCollectionId: z.string(),
    paymentSessionId: z.string(),
    amount: z.number(),
    currencyCode: z.string(),
    providerId: z.string(),
    data: z.record(z.string(), z.unknown()).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    capturedAt: z.iso.datetime().nullable(),
    canceledAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
    captures: z.array(AdminCapture).optional(),
    refunds: z.array(AdminRefund).optional(),
  })
  .openapi('AdminPayment')
export type AdminPayment = z.infer<typeof AdminPayment>

export const AdminPaymentSession = z
  .object({
    id: z.string(),
    paymentCollectionId: z.string(),
    providerId: z.string(),
    currencyCode: z.string(),
    amount: z.number(),
    status: z.enum([
      'pending',
      'authorized',
      'captured',
      'requires_more',
      'error',
      'canceled',
      'pending_authorization',
    ]),
    data: z.record(z.string(), z.unknown()),
    context: z.record(z.string(), z.unknown()).nullable(),
    authorizedAt: z.iso.datetime().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
    payment: AdminPayment.optional(),
  })
  .openapi('AdminPaymentSession')
export type AdminPaymentSession = z.infer<typeof AdminPaymentSession>

export const AdminPaymentCollection = z
  .object({
    id: z.string(),
    currencyCode: z.string(),
    amount: z.number(),
    authorizedAmount: z.number().nullable(),
    capturedAmount: z.number().nullable(),
    refundedAmount: z.number().nullable(),
    completedAt: z.iso.datetime().nullable(),
    status: z.enum(['not_paid', 'awaiting', 'authorized', 'partially_authorized', 'completed']),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
    paymentSessions: z.array(AdminPaymentSession).optional(),
    payments: z.array(AdminPayment).optional(),
  })
  .openapi('AdminPaymentCollection')
export type AdminPaymentCollection = z.infer<typeof AdminPaymentCollection>

export const AdminRefundReason = z
  .object({
    id: z.string(),
    label: z.string(),
    code: z.string(),
    description: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminRefundReason')
export type AdminRefundReason = z.infer<typeof AdminRefundReason>
