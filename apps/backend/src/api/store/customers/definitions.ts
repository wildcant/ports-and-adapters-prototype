import type { RouteDefinition } from '@framework/http/types.js'
import { Tags } from '@framework/http/types.js'
import * as meRoutes from './me/route.js'

export default [
  {
    method: 'GET',
    matcher: '/store/customers/me',
    handler: meRoutes.GET,
    operationId: 'getStoreCustomerMe',
    summary: 'Get the authenticated customer',
    tags: [Tags.CUSTOMERS],
    output: meRoutes.GetOutput,
  },
] satisfies RouteDefinition[]
