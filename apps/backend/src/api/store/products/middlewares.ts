import { IdParams } from '../../../core/http-schemas/common.js'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/store/products',
    operationId: 'listStoreProducts',
    summary: 'List published products',
    tags: [Tags.PRODUCTS],
  },
  {
    method: 'GET',
    matcher: '/store/products/:id',
    paramsSchema: IdParams,
    operationId: 'getStoreProduct',
    summary: 'Retrieve a product with variants',
    tags: [Tags.PRODUCTS],
  },
] satisfies MiddlewareRoute[]
