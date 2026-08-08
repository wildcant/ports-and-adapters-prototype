import type { BaseFilterable, OperatorMap } from '../common.js'
import type { Context } from '../context.js'
import type { ProviderIdentityDTO } from './common.js'
import type { CreateAuthVerificationDTO, UpdateAuthVerificationDTO } from './mutations.js'

export type AuthVerificationDTO = {
  id: string
  authIdentityId: string
  entityId: string
  entityType: string
  codeProvider: string
  verifiedAt: Date | null
  requestedAt: Date
  providerMetadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface FilterableAuthVerificationProps extends BaseFilterable<FilterableAuthVerificationProps> {
  id?: string | string[] | undefined
  authIdentityId?: string | string[] | undefined
  entityId?: string | string[] | OperatorMap<string> | undefined
  entityType?: string | string[] | OperatorMap<string> | undefined
  codeProvider?: string | string[] | OperatorMap<string> | undefined
  providerMetadata?: Record<string, unknown> | OperatorMap<Record<string, unknown>> | undefined
  createdAt?: OperatorMap<Date> | undefined
  updatedAt?: OperatorMap<Date> | undefined
}

export type AuthPasswordResetTokenDTO = {
  id: string
  authIdentityId: string
  providerIdentityId: string
  entityId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export type CreatePasswordResetTokenResult = {
  jti: string
  expiresAt: Date
  providerIdentity: ProviderIdentityDTO
}

export type ConsumePasswordResetTokenResult = {
  authIdentityId: string
  providerIdentityId: string
  entityId: string
}

export type RequestAuthVerificationDTO = {
  entityId: string
  authIdentityId: string
  entityType: string
  codeProvider: string
  metadata?: Record<string, unknown> | null
}

export type ConfirmAuthVerificationDTO = {
  // The verification provider can decide if the auth identity is required to confirm the verification.
  authIdentityId?: string
  code: string
  codeProvider?: string
}

// --- Verification Provider ---

export type AuthVerificationService = {
  list(filters: FilterableAuthVerificationProps, context?: Context): Promise<AuthVerificationDTO[]>
  create(data: CreateAuthVerificationDTO, context?: Context): Promise<AuthVerificationDTO>
  createMany(data: CreateAuthVerificationDTO[], context?: Context): Promise<AuthVerificationDTO[]>
  update(id: string, data: UpdateAuthVerificationDTO, context?: Context): Promise<AuthVerificationDTO>
  updateMany(ids: string[], data: UpdateAuthVerificationDTO, context?: Context): Promise<AuthVerificationDTO[]>
}

export type RequestAuthVerificationResult = AuthVerificationDTO & {
  code?: string
  expiresAt?: Date
}

export type ConfirmAuthVerificationResult = AuthVerificationDTO

export type IAuthVerificationProvider = {
  request(data: RequestAuthVerificationDTO, service: AuthVerificationService): Promise<RequestAuthVerificationResult>
  confirm(data: ConfirmAuthVerificationDTO, service: AuthVerificationService): Promise<ConfirmAuthVerificationResult>
}
