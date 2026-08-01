import { IdParams, StoreProductListParams, StoreProductListResponse, StoreProductResponse } from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { searchable, Tags } from '../../../core/middleware/types.js'
import type { ProductDTO } from '../../../core/types/product/common.js'

export default [
  {
    method: 'GET',
    matcher: '/store/products',
    querySchema: StoreProductListParams,
    searchableColumns: searchable<ProductDTO>('title'),
    operationId: 'listStoreProducts',
    summary: 'List published products',
    tags: [Tags.PRODUCTS],
    responseSchema: StoreProductListResponse,
  },
  {
    method: 'GET',
    matcher: '/store/products/:id',
    paramsSchema: IdParams,
    operationId: 'getStoreProduct',
    summary: 'Retrieve a product with variants',
    tags: [Tags.PRODUCTS],
    responseSchema: StoreProductResponse,
  },
] satisfies MiddlewareRoute[]
