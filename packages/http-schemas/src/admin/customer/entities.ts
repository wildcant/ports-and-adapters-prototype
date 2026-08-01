import { z } from 'zod'

export const AdminCustomer = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminCustomer')
export type AdminCustomer = z.infer<typeof AdminCustomer>
