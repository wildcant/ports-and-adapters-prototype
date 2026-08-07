import type { ActorType } from '@proteus/http-schemas/auth'

/**
 * Controls which auth providers each actor type can use.
 * Enforced by `validateScopeProviderAssociation` middleware.
 * If absent for an actor type, all providers are allowed.
 */
export const authMethodsPerActor: Partial<Record<ActorType, string[]>> = {
  user: ['emailpass'],
  customer: ['emailpass'],
}

/**
 * Controls which actor types require entity verification (e.g., email)
 * and with which auth providers. Checked by `generateJwtTokenWithChecks`
 * at login and token refresh. If absent for an actor type, no verification required.
 */
export const authVerificationsPerActor: Partial<Record<ActorType, { entityType: string; authProvider: string }[]>> = {
  // TODO: add verification config for customer actor type once notifications module is implemented
  // customer: [{ entityType: 'email', authProvider: 'emailpass' }],
}
