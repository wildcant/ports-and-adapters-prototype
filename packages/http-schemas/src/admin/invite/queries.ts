import { z } from 'zod'
import { createFindParams, type FindParams } from '../../common.js'

export const AdminInviteListParams = createFindParams().extend({
  id: z.union([z.string(), z.array(z.string())]).optional(),
  email: z.string().optional(),
})

export type AdminInviteListQuery = FindParams<typeof AdminInviteListParams>
