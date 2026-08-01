import {
  AdminCreateCustomers,
  AdminCustomerDeleteResponse,
  AdminCustomerListParams,
  AdminCustomerListResponse,
  AdminCustomerResponse,
  AdminUpdateCustomer,
  IdParams,
} from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/customers',
    querySchema: AdminCustomerListParams,
    operationId: 'listCustomers',
    summary: 'List customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: AdminCustomerListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/customers',
    bodySchema: AdminCreateCustomers,
    operationId: 'createCustomers',
    summary: 'Create customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: AdminCustomerListResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/customers/:id',
    paramsSchema: IdParams,
    operationId: 'getCustomer',
    summary: 'Retrieve a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: AdminCustomerResponse,
  },
  {
    method: 'PATCH',
    matcher: '/admin/customers/:id',
    paramsSchema: IdParams,
    bodySchema: AdminUpdateCustomer,
    operationId: 'updateCustomer',
    summary: 'Update a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: AdminCustomerResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/customers/:id',
    paramsSchema: IdParams,
    operationId: 'deleteCustomer',
    summary: 'Delete a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: AdminCustomerDeleteResponse,
  },
] satisfies MiddlewareRoute[]
