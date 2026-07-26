import {
  AddLineItem,
  CreateCart,
  LineIdParams,
  UpdateCart,
  UpdateLineItem,
} from '../../../core/http-schemas/cart/payloads.js'
import { IdParams } from '../../../core/http-schemas/common.js'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'POST',
    matcher: '/store/carts',
    bodySchema: CreateCart,
    operationId: 'createStoreCart',
    summary: 'Create a cart',
    tags: [Tags.CARTS],
  },
  {
    method: 'GET',
    matcher: '/store/carts/:id',
    paramsSchema: IdParams,
    operationId: 'getStoreCart',
    summary: 'Retrieve a cart with line items',
    tags: [Tags.CARTS],
  },
  {
    method: 'POST',
    matcher: '/store/carts/:id',
    paramsSchema: IdParams,
    bodySchema: UpdateCart,
    operationId: 'updateStoreCart',
    summary: 'Update a cart',
    tags: [Tags.CARTS],
  },
  {
    method: 'POST',
    matcher: '/store/carts/:id/line-items',
    paramsSchema: IdParams,
    bodySchema: AddLineItem,
    operationId: 'addStoreCartLineItem',
    summary: 'Add a line item to a cart',
    tags: [Tags.CARTS],
  },
  {
    method: 'POST',
    matcher: '/store/carts/:id/line-items/:lineId',
    paramsSchema: LineIdParams,
    bodySchema: UpdateLineItem,
    operationId: 'updateStoreCartLineItem',
    summary: 'Update a cart line item',
    tags: [Tags.CARTS],
  },
  {
    method: 'DELETE',
    matcher: '/store/carts/:id/line-items/:lineId',
    paramsSchema: LineIdParams,
    operationId: 'deleteStoreCartLineItem',
    summary: 'Remove a line item from a cart',
    tags: [Tags.CARTS],
  },
  {
    method: 'POST',
    matcher: '/store/carts/:id/complete',
    paramsSchema: IdParams,
    operationId: 'completeStoreCart',
    summary: 'Complete a cart (authorize payment and mark as completed)',
    tags: [Tags.CARTS],
  },
] satisfies MiddlewareRoute[]
