import { IdParams } from '../../core/http-schemas/common.js'
import { CreateCustomers, UpdateCustomer } from '../../core/http-schemas/customer/payloads.js'
import {
  CustomerDeleteResponse,
  CustomerListResponse,
  CustomerResponse,
} from '../../core/http-schemas/customer/responses.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/customers',
    operationId: 'listCustomers',
    summary: 'List customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerListResponse,
  },
  {
    method: 'POST',
    matcher: '/customers',
    bodySchema: CreateCustomers,
    operationId: 'createCustomers',
    summary: 'Create customers',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerListResponse,
  },
  {
    method: 'GET',
    matcher: '/customers/:id',
    paramsSchema: IdParams,
    operationId: 'getCustomer',
    summary: 'Retrieve a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerResponse,
  },
  {
    method: 'PATCH',
    matcher: '/customers/:id',
    paramsSchema: IdParams,
    bodySchema: UpdateCustomer,
    operationId: 'updateCustomer',
    summary: 'Update a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerResponse,
  },
  {
    method: 'DELETE',
    matcher: '/customers/:id',
    paramsSchema: IdParams,
    operationId: 'deleteCustomer',
    summary: 'Delete a customer',
    tags: [Tags.CUSTOMERS],
    responseSchema: CustomerDeleteResponse,
  },
] satisfies MiddlewareRoute[]
