import { z } from 'zod'
import { PaginatedResponse } from '../common.js'
import { Customer } from './entities.js'

export const CustomerResponse = z.object({ customer: Customer }).openapi('CustomerResponse')
export type CustomerResponse = z.infer<typeof CustomerResponse>

export const CustomerListResponse = PaginatedResponse.extend({ customers: z.array(Customer) }).openapi(
  'CustomerListResponse',
)
export type CustomerListResponse = z.infer<typeof CustomerListResponse>

export const CustomerDeleteResponse = z
  .object({ id: z.string(), deleted: z.boolean() })
  .openapi('CustomerDeleteResponse')
export type CustomerDeleteResponse = z.infer<typeof CustomerDeleteResponse>
