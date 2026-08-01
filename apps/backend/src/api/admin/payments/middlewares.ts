import {
  AdminCapturePayment,
  AdminPaymentProviderListResponse,
  AdminPaymentResponse,
  AdminRefundPayment,
  IdParams,
} from '@proteus/http-schemas'
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
    responseSchema: AdminPaymentResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/payments/payment-providers',
    operationId: 'listAdminPaymentProviders',
    summary: 'List payment providers',
    tags: [Tags.PAYMENTS],
    responseSchema: AdminPaymentProviderListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/payments/:id/capture',
    paramsSchema: IdParams,
    bodySchema: AdminCapturePayment,
    operationId: 'capturePayment',
    summary: 'Capture a payment',
    tags: [Tags.PAYMENTS],
    responseSchema: AdminPaymentResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/payments/:id/refund',
    paramsSchema: IdParams,
    bodySchema: AdminRefundPayment,
    operationId: 'refundPayment',
    summary: 'Refund a payment',
    tags: [Tags.PAYMENTS],
    responseSchema: AdminPaymentResponse,
  },
] satisfies MiddlewareRoute[]
