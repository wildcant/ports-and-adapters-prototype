import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { Customer } from './entities.js'

export const CustomerResponse = z.object({ customer: Customer }).openapi('CustomerResponse')
export type CustomerResponse = z.input<typeof CustomerResponse>

export const CustomerListResponse = PaginatedResponse.extend({ customers: z.array(Customer) }).openapi(
  'CustomerListResponse',
)
export type CustomerListResponse = z.input<typeof CustomerListResponse>
