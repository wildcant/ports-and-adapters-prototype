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
