import { z } from 'zod'

export const AdminUser = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminUser')
export type AdminUser = z.infer<typeof AdminUser>
