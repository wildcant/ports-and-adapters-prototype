import {
  AdminCreateCustomers,
  AdminCreateCustomersResponse,
  AdminCustomerListParams,
  AdminCustomerListResponse,
  AdminCustomerResponse,
  AdminUpdateCustomer,
  AdminUpdateCustomerResponse,
  DeleteResponse,
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
    responseSchema: AdminCreateCustomersResponse,
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
    responseSchema: AdminUpdateCustomerResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/customers/:id',
    paramsSchema: IdParams,
    operationId: 'deleteCustomer',
    summary: 'Delete a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: DeleteResponse,
  },
] satisfies MiddlewareRoute[]
