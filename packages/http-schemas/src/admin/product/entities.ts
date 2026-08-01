import { z } from 'zod'

export const ProductStatus = z.enum(['draft', 'proposed', 'published', 'rejected'])

export const AdminProduct = z
  .object({
    id: z.string(),
    title: z.string(),
    handle: z.string(),
    subtitle: z.string().nullable(),
    description: z.string().nullable(),
    isGiftcard: z.boolean(),
    status: ProductStatus,
    thumbnail: z.string().nullable(),
    weight: z.number().nullable(),
    length: z.number().nullable(),
    height: z.number().nullable(),
    width: z.number().nullable(),
    originCountry: z.string().nullable(),
    hsCode: z.string().nullable(),
    midCode: z.string().nullable(),
    material: z.string().nullable(),
    discountable: z.boolean(),
    externalId: z.string().nullable(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminProduct')
export type AdminProduct = z.infer<typeof AdminProduct>
