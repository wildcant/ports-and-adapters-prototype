import { z } from 'zod'
import { AdminPayment, AdminPaymentCollection, AdminPaymentProvider, AdminRefundReason } from './entities.js'

export const AdminPaymentProviderListResponse = z
  .object({ paymentProviders: z.array(AdminPaymentProvider) })
  .openapi('AdminPaymentProviderListResponse')
export type AdminPaymentProviderListResponse = z.infer<typeof AdminPaymentProviderListResponse>

export const AdminPaymentResponse = z.object({ payment: AdminPayment }).openapi('AdminPaymentResponse')
export type AdminPaymentResponse = z.infer<typeof AdminPaymentResponse>

export const AdminPaymentCollectionResponse = z
  .object({ paymentCollection: AdminPaymentCollection })
  .openapi('AdminPaymentCollectionResponse')
export type AdminPaymentCollectionResponse = z.infer<typeof AdminPaymentCollectionResponse>

export const AdminRefundReasonListResponse = z
  .object({ refundReasons: z.array(AdminRefundReason) })
  .openapi('AdminRefundReasonListResponse')
export type AdminRefundReasonListResponse = z.infer<typeof AdminRefundReasonListResponse>

export const AdminRefundReasonResponse = z
  .object({ refundReason: AdminRefundReason })
  .openapi('AdminRefundReasonResponse')
export type AdminRefundReasonResponse = z.infer<typeof AdminRefundReasonResponse>

export const AdminCreateRefundReasonResponse = z
  .object({ refundReason: AdminRefundReason })
  .openapi('AdminCreateRefundReasonResponse')
export type AdminCreateRefundReasonResponse = z.infer<typeof AdminCreateRefundReasonResponse>
