import { CapturePayment, IdParams, RefundPayment } from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
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
] satisfies MiddlewareRoute[]
