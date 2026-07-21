import { z } from 'zod'
import { createFindParams, type FindParams } from '../common.js'

export const UserListParams = createFindParams().extend({
  id: z.union([z.string(), z.array(z.string())]).optional(),
  email: z.string().optional(),
})

export type UserListQuery = FindParams<typeof UserListParams>
