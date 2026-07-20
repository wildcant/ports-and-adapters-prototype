import { z } from 'zod'
import { Customer } from './entities.js'

export const CustomerResponse = z.object({ customer: Customer }).openapi('CustomerResponse')
export const CustomerListResponse = z
  .object({ customers: z.array(Customer), count: z.number() })
  .openapi('CustomerListResponse')
export const CustomerDeleteResponse = z
  .object({ id: z.string(), deleted: z.boolean() })
  .openapi('CustomerDeleteResponse')
