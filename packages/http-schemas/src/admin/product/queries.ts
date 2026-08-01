import { z } from 'zod'
import { createFindParams, createOperatorMap, type FindParams } from '../../common.js'
import { ProductStatus } from './entities.js'

export const AdminProductListParams = createFindParams().extend({
  q: z.string().optional(),
  status: z.union([ProductStatus, ProductStatus.array()]).optional(),
  createdAt: createOperatorMap().optional(),
})

export type AdminProductListQuery = FindParams<typeof AdminProductListParams>
