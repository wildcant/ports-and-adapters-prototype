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

export const VerificationRequestResponse = z
  .object({
    id: z.string(),
    entityId: z.string(),
    entityType: z.string(),
    requestedAt: z.string().datetime(),
  })
  .openapi('VerificationRequestResponse')
export type VerificationRequestResponse = z.infer<typeof VerificationRequestResponse>

export const VerificationConfirmResponse = z
  .object({
    id: z.string(),
    entityId: z.string(),
    entityType: z.string(),
    verifiedAt: z.string().datetime(),
  })
  .openapi('VerificationConfirmResponse')
export type VerificationConfirmResponse = z.infer<typeof VerificationConfirmResponse>
