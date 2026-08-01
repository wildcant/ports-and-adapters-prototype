import {
  CreatePaymentCollection,
  CreatePaymentSession,
  IdParams,
  StoreCreatePaymentCollectionResponse,
  StoreCreatePaymentSessionResponse,
} from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'POST',
    matcher: '/store/payment-collections',
    bodySchema: CreatePaymentCollection,
    operationId: 'createStorePaymentCollection',
    summary: 'Create a payment collection for a cart',
    tags: [Tags.PAYMENT_COLLECTIONS],
    responseSchema: StoreCreatePaymentCollectionResponse,
  },
  {
    method: 'POST',
    matcher: '/store/payment-collections/:id/payment-sessions',
    paramsSchema: IdParams,
    bodySchema: CreatePaymentSession,
    operationId: 'createStorePaymentSession',
    summary: 'Create a payment session',
    tags: [Tags.PAYMENT_COLLECTIONS],
    responseSchema: StoreCreatePaymentSessionResponse,
  },
] satisfies MiddlewareRoute[]
