import { IdParams } from '../../core/http-schemas/common.js'
import { CreatePaymentCollection, CreatePaymentSession } from '../../core/http-schemas/payment/payloads.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'POST',
    matcher: '/store/payment-collections',
    bodySchema: CreatePaymentCollection,
    operationId: 'createStorePaymentCollection',
    summary: 'Create a payment collection for a cart',
    tags: [Tags.PAYMENT_COLLECTIONS],
  },
  {
    method: 'GET',
    matcher: '/store/payment-providers',
    operationId: 'listStorePaymentProviders',
    summary: 'List enabled payment providers',
    tags: [Tags.PAYMENTS],
  },
  {
    method: 'POST',
    matcher: '/store/payment-collections/:id/payment-sessions',
    paramsSchema: IdParams,
    bodySchema: CreatePaymentSession,
    operationId: 'createStorePaymentSession',
    summary: 'Create a payment session',
    tags: [Tags.PAYMENT_COLLECTIONS],
  },
] satisfies MiddlewareRoute[]
