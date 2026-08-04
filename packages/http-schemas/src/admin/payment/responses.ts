import { z } from 'zod'
import { AdminPayment, AdminPaymentCollection, AdminPaymentProvider, AdminRefundReason } from './entities.js'

export const AdminPaymentProviderListResponse = z
  .object({ paymentProviders: z.array(AdminPaymentProvider) })
  .openapi('AdminPaymentProviderListResponse')
export type AdminPaymentProviderListResponse = z.input<typeof AdminPaymentProviderListResponse>

export const AdminPaymentResponse = z.object({ payment: AdminPayment }).openapi('AdminPaymentResponse')
export type AdminPaymentResponse = z.input<typeof AdminPaymentResponse>

export const AdminPaymentCollectionResponse = z
  .object({ paymentCollection: AdminPaymentCollection })
  .openapi('AdminPaymentCollectionResponse')
export type AdminPaymentCollectionResponse = z.input<typeof AdminPaymentCollectionResponse>

export const AdminRefundReasonListResponse = z
  .object({ refundReasons: z.array(AdminRefundReason) })
  .openapi('AdminRefundReasonListResponse')
export type AdminRefundReasonListResponse = z.input<typeof AdminRefundReasonListResponse>

export const AdminRefundReasonResponse = z
  .object({ refundReason: AdminRefundReason })
  .openapi('AdminRefundReasonResponse')
export type AdminRefundReasonResponse = z.input<typeof AdminRefundReasonResponse>

export const AdminCreateRefundReasonResponse = z
  .object({ refundReason: AdminRefundReason })
  .openapi('AdminCreateRefundReasonResponse')
export type AdminCreateRefundReasonResponse = z.input<typeof AdminCreateRefundReasonResponse>
