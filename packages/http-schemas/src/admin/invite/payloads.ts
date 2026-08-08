import { z } from 'zod'

export const AdminCreateInvite = z.object({
  email: z.email(),
  // TODO(RBAC): roles when RBAC is implemented
})
export type AdminCreateInvite = z.infer<typeof AdminCreateInvite>

export const AdminAcceptInvite = z.object({
  token: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(1),
})
export type AdminAcceptInvite = z.infer<typeof AdminAcceptInvite>
