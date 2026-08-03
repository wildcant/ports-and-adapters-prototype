import { z } from 'zod'

export const AdminProductVariant = z
  .object({
    id: z.string(),
    productId: z.string(),
    title: z.string(),
    sku: z.string().nullable(),
    barcode: z.string().nullable(),
    ean: z.string().nullable(),
    upc: z.string().nullable(),
    allowBackorder: z.boolean(),
    manageInventory: z.boolean(),
    hsCode: z.string().nullable(),
    originCountry: z.string().nullable(),
    midCode: z.string().nullable(),
    material: z.string().nullable(),
    weight: z.number().nullable(),
    length: z.number().nullable(),
    height: z.number().nullable(),
    width: z.number().nullable(),
    variantRank: z.number().nullable(),
    metadata: z.string().nullable(),
  })
  .openapi('AdminProductVariant')
export type AdminProductVariant = z.infer<typeof AdminProductVariant>
