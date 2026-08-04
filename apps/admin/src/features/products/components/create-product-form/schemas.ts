import { AdminCreateProduct } from '@proteus/http-schemas/admin'
import { z } from 'zod'

export const detailsSchema = AdminCreateProduct.pick({
  title: true,
  subtitle: true,
  handle: true,
  description: true,
})

export const organizeSchema = AdminCreateProduct.pick({
  discountable: true,
})

export const attributesSchema = AdminCreateProduct.pick({
  material: true,
  originCountry: true,
  hsCode: true,
  midCode: true,
  weight: true,
  length: true,
  height: true,
  width: true,
})

export const productFormSchema = z.object({
  details: detailsSchema,
  organize: organizeSchema,
  attributes: attributesSchema,
})

export type ProductFormValues = z.infer<typeof productFormSchema>
