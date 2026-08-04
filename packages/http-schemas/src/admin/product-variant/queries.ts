import { z } from 'zod'
import { createDateOperatorMap, createFindParams, type FindParams } from '../../common.js'

export const VariantIdParams = z.object({ id: z.string().min(1), variantId: z.string().min(1) })
export type VariantIdParams = z.infer<typeof VariantIdParams>

export const AdminProductVariantListParams = createFindParams({ limit: 10 }).extend({
  q: z.string().optional(),
  allowBackorder: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  manageInventory: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  createdAt: createDateOperatorMap().optional(),
})

export type AdminProductVariantListQuery = FindParams<typeof AdminProductVariantListParams>
