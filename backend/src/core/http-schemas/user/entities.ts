import '../../openapi/setup.js'
import { z } from 'zod'

export const User = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
  })
  .openapi('User')
