import { z } from 'zod'

export const StoreSignupBody = z
  .object({
    email: z.email(),
    password: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  })
  .openapi('StoreSignupBody')
export type StoreSignupBody = z.infer<typeof StoreSignupBody>

export const StoreLoginBody = z
  .object({
    email: z.email(),
    password: z.string().min(1),
  })
  .openapi('StoreLoginBody')
export type StoreLoginBody = z.infer<typeof StoreLoginBody>
