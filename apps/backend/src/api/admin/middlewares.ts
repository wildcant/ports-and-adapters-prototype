import { IdParams } from '../../core/http-schemas/common.js'
import { CapturePayment, CreateRefundReason, RefundPayment } from '../../core/http-schemas/payment/payloads.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/payment-collections/:id',
    paramsSchema: IdParams,
    operationId: 'getPaymentCollection',
    summary: 'Retrieve a payment collection',
    tags: [Tags.PAYMENT_COLLECTIONS],
  },
  {
    method: 'POST',
    matcher: '/admin/payment-collections/:id/mark-as-paid',
    paramsSchema: IdParams,
    operationId: 'markPaymentCollectionAsPaid',
    summary: 'Mark a payment collection as paid',
    tags: [Tags.PAYMENT_COLLECTIONS],
  },
  {
    method: 'GET',
    matcher: '/admin/payments/:id',
    paramsSchema: IdParams,
    operationId: 'getPayment',
    summary: 'Retrieve a payment',
    tags: [Tags.PAYMENTS],
  },
  {
    method: 'GET',
    matcher: '/admin/payments/payment-providers',
    operationId: 'listAdminPaymentProviders',
    summary: 'List payment providers',
    tags: [Tags.PAYMENTS],
  },
  {
    method: 'POST',
    matcher: '/admin/payments/:id/capture',
    paramsSchema: IdParams,
    bodySchema: CapturePayment,
    operationId: 'capturePayment',
    summary: 'Capture a payment',
    tags: [Tags.PAYMENTS],
  },
  {
    method: 'POST',
    matcher: '/admin/payments/:id/refund',
    paramsSchema: IdParams,
    bodySchema: RefundPayment,
    operationId: 'refundPayment',
    summary: 'Refund a payment',
    tags: [Tags.PAYMENTS],
  },
  {
    method: 'GET',
    matcher: '/admin/refund-reasons',
    operationId: 'listRefundReasons',
    summary: 'List refund reasons',
    tags: [Tags.REFUND_REASONS],
  },
  {
    method: 'POST',
    matcher: '/admin/refund-reasons',
    bodySchema: CreateRefundReason,
    operationId: 'createRefundReason',
    summary: 'Create a refund reason',
    tags: [Tags.REFUND_REASONS],
  },
  {
    method: 'DELETE',
    matcher: '/admin/refund-reasons/:id',
    paramsSchema: IdParams,
    operationId: 'deleteRefundReason',
    summary: 'Delete a refund reason',
    tags: [Tags.REFUND_REASONS],
  },
] satisfies MiddlewareRoute[]
