import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/fulfillment-providers',
    operationId: 'listAdminFulfillmentProviders',
    summary: 'List fulfillment providers',
    tags: [Tags.FULFILLMENT_PROVIDERS],
  },
] satisfies MiddlewareRoute[]
