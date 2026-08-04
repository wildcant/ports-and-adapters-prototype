import { z } from 'zod'
import { timestamps } from '../../common.js'

export const User = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    ...timestamps.shape,
  })
  .openapi('User')
export type User = z.input<typeof User>
