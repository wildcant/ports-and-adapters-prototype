import { z } from 'zod'
import { timestamps } from '../../common.js'

export const AdminCustomer = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    ...timestamps.shape,
  })
  .openapi('AdminCustomer')
export type AdminCustomer = z.input<typeof AdminCustomer>
