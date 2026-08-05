export type CreateAuthIdentityDTO = {
  appMetadata?: Record<string, unknown> | null | undefined
}

export type UpdateAuthIdentityDTO = {
  appMetadata?: Record<string, unknown> | null | undefined
}

export type CreateProviderIdentityDTO = {
  authIdentityId: string
  entityId: string
  provider: string
  providerMetadata?: Record<string, unknown> | null | undefined
  userMetadata?: Record<string, unknown> | null | undefined
}

export type UpdateProviderIdentityDTO = {
  providerMetadata?: Record<string, unknown> | null | undefined
  userMetadata?: Record<string, unknown> | null | undefined
}

export type CreateAuthVerificationDTO = {
  authIdentityId: string
  entityId: string
  entityType: string
  codeProvider: string
  requestedAt: Date
  providerMetadata?: Record<string, unknown> | null | undefined
}

export type UpdateAuthVerificationDTO = {
  codeProvider?: string | undefined
  verifiedAt?: Date | null | undefined
  requestedAt?: Date | undefined
  providerMetadata?: Record<string, unknown> | null | undefined
}

export type CreateAuthPasswordResetTokenDTO = {
  authIdentityId: string
  providerIdentityId: string
  entityId: string
  tokenHash: string
  expiresAt: Date
}

export type CreatePasswordResetTokenDTO = {
  provider: string
  entityId: string
  ttlSeconds?: number
}

export type ConsumePasswordResetTokenDTO = {
  jti: string
  provider: string
  entityId: string
}
