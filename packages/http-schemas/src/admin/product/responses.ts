import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminProduct } from './entities.js'

export const AdminProductResponse = z.object({ product: AdminProduct }).openapi('AdminProductResponse')
export type AdminProductResponse = z.infer<typeof AdminProductResponse>

export const AdminProductListResponse = PaginatedResponse.extend({
  products: z.array(AdminProduct),
}).openapi('AdminProductListResponse')
export type AdminProductListResponse = z.infer<typeof AdminProductListResponse>

export const AdminProductDeleteResponse = z
  .object({ id: z.string(), deleted: z.boolean() })
  .openapi('AdminProductDeleteResponse')
export type AdminProductDeleteResponse = z.infer<typeof AdminProductDeleteResponse>
