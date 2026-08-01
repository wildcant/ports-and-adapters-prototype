import { AdminFulfillmentProviderListResponse } from '@proteus/http-schemas/admin'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/fulfillment-providers',
    operationId: 'listAdminFulfillmentProviders',
    summary: 'List fulfillment providers',
    tags: [Tags.FULFILLMENT_PROVIDERS],
    responseSchema: AdminFulfillmentProviderListResponse,
  },
] satisfies MiddlewareRoute[]
