import { CreateShippingOption, IdParams, UpdateShippingOption } from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/shipping-options',
    operationId: 'listAdminShippingOptions',
    summary: 'List shipping options',
    tags: [Tags.SHIPPING_OPTIONS],
  },
  {
    method: 'POST',
    matcher: '/admin/shipping-options',
    bodySchema: CreateShippingOption,
    operationId: 'createAdminShippingOption',
    summary: 'Create a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
  },
  {
    method: 'GET',
    matcher: '/admin/shipping-options/:id',
    paramsSchema: IdParams,
    operationId: 'getAdminShippingOption',
    summary: 'Retrieve a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
  },
  {
    method: 'POST',
    matcher: '/admin/shipping-options/:id',
    paramsSchema: IdParams,
    bodySchema: UpdateShippingOption,
    operationId: 'updateAdminShippingOption',
    summary: 'Update a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
  },
  {
    method: 'DELETE',
    matcher: '/admin/shipping-options/:id',
    paramsSchema: IdParams,
    operationId: 'deleteAdminShippingOption',
    summary: 'Delete a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
  },
] satisfies MiddlewareRoute[]
