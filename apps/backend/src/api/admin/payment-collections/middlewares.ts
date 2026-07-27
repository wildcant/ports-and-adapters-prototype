import { IdParams } from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

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
] satisfies MiddlewareRoute[]
