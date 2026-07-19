import '../../../openapi/setup.js'
import { z } from 'zod'

export const Customer = z
  .object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
  })
  .openapi('Customer')
