import { AdminPaymentCollectionResponse, IdParams } from '@proteus/http-schemas/admin'
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
    responseSchema: AdminPaymentCollectionResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/payment-collections/:id/mark-as-paid',
    paramsSchema: IdParams,
    operationId: 'markPaymentCollectionAsPaid',
    summary: 'Mark a payment collection as paid',
    tags: [Tags.PAYMENT_COLLECTIONS],
    responseSchema: AdminPaymentCollectionResponse,
  },
] satisfies MiddlewareRoute[]
