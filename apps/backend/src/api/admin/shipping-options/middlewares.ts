import {
  AdminCreateShippingOption,
  AdminCreateShippingOptionResponse,
  AdminShippingOptionListResponse,
  AdminShippingOptionResponse,
  AdminUpdateShippingOption,
  AdminUpdateShippingOptionResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas/admin'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/shipping-options',
    operationId: 'listAdminShippingOptions',
    summary: 'List shipping options',
    tags: [Tags.SHIPPING_OPTIONS],
    responseSchema: AdminShippingOptionListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/shipping-options',
    bodySchema: AdminCreateShippingOption,
    operationId: 'createAdminShippingOption',
    summary: 'Create a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
    responseSchema: AdminCreateShippingOptionResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/shipping-options/:id',
    paramsSchema: IdParams,
    operationId: 'getAdminShippingOption',
    summary: 'Retrieve a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
    responseSchema: AdminShippingOptionResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/shipping-options/:id',
    paramsSchema: IdParams,
    bodySchema: AdminUpdateShippingOption,
    operationId: 'updateAdminShippingOption',
    summary: 'Update a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
    responseSchema: AdminUpdateShippingOptionResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/shipping-options/:id',
    paramsSchema: IdParams,
    operationId: 'deleteAdminShippingOption',
    summary: 'Delete a shipping option',
    tags: [Tags.SHIPPING_OPTIONS],
    responseSchema: DeleteResponse,
  },
] satisfies MiddlewareRoute[]
