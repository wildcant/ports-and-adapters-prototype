import { z } from 'zod'

export const StorePaymentProvider = z
  .object({
    id: z.string(),
    isEnabled: z.boolean(),
  })
  .openapi('StorePaymentProvider')
export type StorePaymentProvider = z.infer<typeof StorePaymentProvider>

export const StorePaymentSession = z
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
  })
  .openapi('StorePaymentSession')
export type StorePaymentSession = z.infer<typeof StorePaymentSession>

export const StorePaymentCollection = z
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
  })
  .openapi('StorePaymentCollection')
export type StorePaymentCollection = z.infer<typeof StorePaymentCollection>
