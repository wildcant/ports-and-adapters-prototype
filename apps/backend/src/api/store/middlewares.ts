import { AddLineItem, CreateCart, LineIdParams, UpdateCart, UpdateLineItem } from '../../core/http-schemas/cart/payloads.js'
import { IdParams } from '../../core/http-schemas/common.js'
import { CreatePaymentCollection, CreatePaymentSession } from '../../core/http-schemas/payment/payloads.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  // Products
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
  // Carts
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
  // Payment Collections
  {
    method: 'POST',
    matcher: '/store/payment-collections',
    bodySchema: CreatePaymentCollection,
    operationId: 'createStorePaymentCollection',
    summary: 'Create a payment collection for a cart',
    tags: [Tags.PAYMENT_COLLECTIONS],
  },
  {
    method: 'GET',
    matcher: '/store/payment-providers',
    operationId: 'listStorePaymentProviders',
    summary: 'List enabled payment providers',
    tags: [Tags.PAYMENTS],
  },
  {
    method: 'POST',
    matcher: '/store/payment-collections/:id/payment-sessions',
    paramsSchema: IdParams,
    bodySchema: CreatePaymentSession,
    operationId: 'createStorePaymentSession',
    summary: 'Create a payment session',
    tags: [Tags.PAYMENT_COLLECTIONS],
  },
] satisfies MiddlewareRoute[]
