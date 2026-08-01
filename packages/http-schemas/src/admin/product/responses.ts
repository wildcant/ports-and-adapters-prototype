import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminProduct } from './entities.js'

export const AdminProductResponse = z.object({ product: AdminProduct }).openapi('AdminProductResponse')
export type AdminProductResponse = z.infer<typeof AdminProductResponse>

export const AdminCreateProductResponse = z.object({ product: AdminProduct }).openapi('AdminCreateProductResponse')
export type AdminCreateProductResponse = z.infer<typeof AdminCreateProductResponse>

export const AdminUpdateProductResponse = z.object({ product: AdminProduct }).openapi('AdminUpdateProductResponse')
export type AdminUpdateProductResponse = z.infer<typeof AdminUpdateProductResponse>

export const AdminProductListResponse = PaginatedResponse.extend({
  products: z.array(AdminProduct),
}).openapi('AdminProductListResponse')
export type AdminProductListResponse = z.infer<typeof AdminProductListResponse>
