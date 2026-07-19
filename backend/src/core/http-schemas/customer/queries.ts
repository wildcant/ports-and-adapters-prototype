import { z } from 'zod'

export const CustomerParams = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
})
