import { z } from 'zod'

export const actorTypes = ['user', 'customer'] as const
export type ActorType = (typeof actorTypes)[number]

export const AuthParams = z.object({
  actorType: z.enum(actorTypes),
  authProvider: z.string().min(1),
})
export type AuthParams = z.infer<typeof AuthParams>

export const AuthBody = z.record(z.string(), z.string()).openapi('AuthBody')
export type AuthBody = z.infer<typeof AuthBody>

export const VerificationConfirmBody = z
  .object({
    code: z.string().min(1),
    codeProvider: z.string().min(1).optional(),
  })
  .openapi('VerificationConfirmBody')
export type VerificationConfirmBody = z.infer<typeof VerificationConfirmBody>

export const ResetPasswordBody = z
  .object({
    email: z.email(),
  })
  .openapi('ResetPasswordBody')
export type ResetPasswordBody = z.infer<typeof ResetPasswordBody>

export const UpdatePasswordBody = z
  .object({
    password: z.string().min(1),
  })
  .openapi('UpdatePasswordBody')
export type UpdatePasswordBody = z.infer<typeof UpdatePasswordBody>

export const VerificationRequestBody = z
  .object({
    entityId: z.string().min(1),
    entityType: z.string().min(1),
    codeProvider: z.string().min(1).default('token'),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .openapi('VerificationRequestResponse')
export type VerificationRequestBody = z.infer<typeof VerificationRequestBody>
