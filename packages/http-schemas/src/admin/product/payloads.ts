import { z } from 'zod'
import { ProductStatus } from './entities.js'

export const AdminCreateProduct = z
  .object({
    description: z.string().optional(),
    discountable: z.boolean().optional(),
    handle: z.string().optional(),
    height: z.number().nullable().optional(),
    hsCode: z.string().optional(),
    length: z.number().nullable().optional(),
    material: z.string().optional(),
    midCode: z.string().optional(),
    originCountry: z.string().optional(),
    status: ProductStatus.optional(),
    subtitle: z.string().optional(),
    title: z.string().min(1),
    weight: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
  })
  .openapi('AdminCreateProduct')
export type AdminCreateProductBody = z.infer<typeof AdminCreateProduct>

export const AdminUpdateProduct = z
  .object({
    title: z.string().min(1),
  })
  .openapi('AdminUpdateProduct')
export type AdminUpdateProductBody = z.infer<typeof AdminUpdateProduct>
