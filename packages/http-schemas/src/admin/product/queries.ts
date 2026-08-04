import { z } from 'zod'
import { createDateOperatorMap, createFindParams, type FindParams } from '../../common.js'
import { ProductStatus } from './entities.js'

export const AdminProductListParams = createFindParams().extend({
  q: z.string().optional(),
  status: z.union([ProductStatus, ProductStatus.array()]).optional(),
  createdAt: createDateOperatorMap().optional(),
})

export type AdminProductListQuery = FindParams<typeof AdminProductListParams>
