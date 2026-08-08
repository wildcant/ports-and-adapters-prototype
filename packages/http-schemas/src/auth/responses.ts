import { z } from 'zod'
import { dateToIso } from '../common.js'

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

// TODO: Define proper response schema for reset password endpoint
export const ResetPasswordResponse = z.object({}).openapi('ResetPasswordResponse')
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponse>

export const UpdatePasswordResponse = z
  .object({
    success: z.boolean(),
  })
  .openapi('UpdatePasswordResponse')
export type UpdatePasswordResponse = z.infer<typeof UpdatePasswordResponse>

export const VerificationRequestResponse = z
  .object({
    id: z.string(),
    entityId: z.string(),
    entityType: z.string(),
    requestedAt: dateToIso,
  })
  .openapi('VerificationRequestResponse')
export type VerificationRequestResponse = z.input<typeof VerificationRequestResponse>

export const VerificationConfirmResponse = z
  .object({
    id: z.string(),
    entityId: z.string(),
    entityType: z.string(),
    verifiedAt: dateToIso,
  })
  .openapi('VerificationConfirmResponse')
export type VerificationConfirmResponse = z.input<typeof VerificationConfirmResponse>
