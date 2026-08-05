import { z } from 'zod'

export const AuthTokenResponse = z
  .object({
    token: z.string(),
  })
  .openapi('AuthTokenResponse')
export type AuthTokenResponse = z.infer<typeof AuthTokenResponse>

export const AuthenticateResponse = z
  .object({
    token: z.string(),
    verificationRequired: z.boolean().optional(),
  })
  .openapi('AuthenticateResponse')
export type AuthenticateResponse = z.infer<typeof AuthenticateResponse>
