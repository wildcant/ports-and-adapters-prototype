import { AdminCreateShippingProfile, AdminUpdateShippingProfile, IdParams } from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/shipping-profiles',
    operationId: 'listAdminShippingProfiles',
    summary: 'List shipping profiles',
    tags: [Tags.SHIPPING_PROFILES],
  },
  {
    method: 'POST',
    matcher: '/admin/shipping-profiles',
    bodySchema: AdminCreateShippingProfile,
    operationId: 'createAdminShippingProfile',
    summary: 'Create a shipping profile',
    tags: [Tags.SHIPPING_PROFILES],
  },
  {
    method: 'POST',
    matcher: '/admin/shipping-profiles/:id',
    paramsSchema: IdParams,
    bodySchema: AdminUpdateShippingProfile,
    operationId: 'updateAdminShippingProfile',
    summary: 'Update a shipping profile',
    tags: [Tags.SHIPPING_PROFILES],
  },
  {
    method: 'DELETE',
    matcher: '/admin/shipping-profiles/:id',
    paramsSchema: IdParams,
    operationId: 'deleteAdminShippingProfile',
    summary: 'Delete a shipping profile',
    tags: [Tags.SHIPPING_PROFILES],
  },
] satisfies MiddlewareRoute[]
