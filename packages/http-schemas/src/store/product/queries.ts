import { z } from 'zod'
import { createFindParams, type FindParams } from '../../common.js'

export const StoreProductListParams = createFindParams().extend({
  q: z.string().optional(),
})

export type StoreProductListQuery = FindParams<typeof StoreProductListParams>
