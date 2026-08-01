import { z } from 'zod'

export const User = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('User')
export type User = z.infer<typeof User>
