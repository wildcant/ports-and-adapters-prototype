import '../../openapi/setup.js'
import { z } from 'zod'

export const User = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
  })
  .openapi('User')
