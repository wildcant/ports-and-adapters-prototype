import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminCustomer } from './entities.js'

export const AdminCustomerResponse = z.object({ customer: AdminCustomer }).openapi('AdminCustomerResponse')
export type AdminCustomerResponse = z.infer<typeof AdminCustomerResponse>

export const AdminCustomerListResponse = PaginatedResponse.extend({
  customers: z.array(AdminCustomer),
}).openapi('AdminCustomerListResponse')
export type AdminCustomerListResponse = z.infer<typeof AdminCustomerListResponse>

export const AdminCreateCustomersResponse = z
  .object({ customers: z.array(AdminCustomer) })
  .openapi('AdminCreateCustomersResponse')
export type AdminCreateCustomersResponse = z.infer<typeof AdminCreateCustomersResponse>

export const AdminUpdateCustomerResponse = z.object({ customer: AdminCustomer }).openapi('AdminUpdateCustomerResponse')
export type AdminUpdateCustomerResponse = z.infer<typeof AdminUpdateCustomerResponse>
