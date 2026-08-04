import { z } from 'zod'
import { timestamps } from '../../common.js'

export const Customer = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    ...timestamps.shape,
  })
  .openapi('Customer')
export type Customer = z.input<typeof Customer>
