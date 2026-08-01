import { z } from 'zod'
import { ProductStatus } from './entities.js'

export const AdminCreateProduct = z
  .object({
    title: z.string().min(1),
  })
  .openapi('AdminCreateProduct')
export type AdminCreateProductBody = z.infer<typeof AdminCreateProduct>

export const AdminUpdateProduct = z
  .object({
    title: z.string().min(1).optional(),
    status: ProductStatus.optional(),
  })
  .openapi('AdminUpdateProduct')
export type AdminUpdateProductBody = z.infer<typeof AdminUpdateProduct>
