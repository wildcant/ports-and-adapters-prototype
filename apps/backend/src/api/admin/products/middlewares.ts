import {
  AdminCreateProduct,
  AdminProductDeleteResponse,
  AdminProductListParams,
  AdminProductListResponse,
  AdminProductResponse,
  AdminUpdateProduct,
  IdParams,
} from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { searchable, Tags } from '../../../core/middleware/types.js'
import type { ProductDTO } from '../../../core/types/product/common.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/products',
    querySchema: AdminProductListParams,
    searchableColumns: searchable<ProductDTO>('title', 'handle'),
    operationId: 'listProducts',
    summary: 'List products',
    tags: [Tags.PRODUCTS],
    responseSchema: AdminProductListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/products',
    bodySchema: AdminCreateProduct,
    operationId: 'createProduct',
    summary: 'Create a product',
    tags: [Tags.PRODUCTS],
    responseSchema: AdminProductResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/products/:id',
    paramsSchema: IdParams,
    operationId: 'getProduct',
    summary: 'Retrieve a product',
    tags: [Tags.PRODUCTS],
    responseSchema: AdminProductResponse,
  },
  {
    method: 'PATCH',
    matcher: '/admin/products/:id',
    paramsSchema: IdParams,
    bodySchema: AdminUpdateProduct,
    operationId: 'updateProduct',
    summary: 'Update a product',
    tags: [Tags.PRODUCTS],
    responseSchema: AdminProductResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/products/:id',
    paramsSchema: IdParams,
    operationId: 'deleteProduct',
    summary: 'Delete a product',
    tags: [Tags.PRODUCTS],
    responseSchema: AdminProductDeleteResponse,
  },
] satisfies MiddlewareRoute[]
