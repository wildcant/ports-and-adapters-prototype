import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminCustomer } from './entities.js'

export const AdminCustomerResponse = z.object({ customer: AdminCustomer }).openapi('AdminCustomerResponse')
export type AdminCustomerResponse = z.infer<typeof AdminCustomerResponse>

export const AdminCustomerListResponse = PaginatedResponse.extend({
  customers: z.array(AdminCustomer),
}).openapi('AdminCustomerListResponse')
export type AdminCustomerListResponse = z.infer<typeof AdminCustomerListResponse>

export const AdminCustomerDeleteResponse = z
  .object({ id: z.string(), deleted: z.boolean() })
  .openapi('AdminCustomerDeleteResponse')
export type AdminCustomerDeleteResponse = z.infer<typeof AdminCustomerDeleteResponse>
