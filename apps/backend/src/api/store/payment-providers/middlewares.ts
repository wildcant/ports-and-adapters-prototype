import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/store/payment-providers',
    operationId: 'listStorePaymentProviders',
    summary: 'List enabled payment providers',
    tags: [Tags.PAYMENTS],
  },
] satisfies MiddlewareRoute[]
