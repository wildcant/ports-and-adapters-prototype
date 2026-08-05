import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type {
  AuthIdentityDTO,
  AuthPasswordResetTokenDTO,
  AuthVerificationDTO,
  FilterableAuthIdentityProps,
  FilterableAuthVerificationProps,
  FilterableProviderIdentityProps,
  ProviderIdentityDTO,
} from './common.js'
import type {
  CreateAuthIdentityDTO,
  CreateAuthPasswordResetTokenDTO,
  CreateAuthVerificationDTO,
  CreateProviderIdentityDTO,
  UpdateAuthIdentityDTO,
  UpdateAuthVerificationDTO,
  UpdateProviderIdentityDTO,
} from './mutations.js'
import type { AuthenticationInput, AuthenticationResponse } from './provider.js'

export type IAuthModuleService = {
  // Auth provider delegation
  register(provider: string, authData: AuthenticationInput): Promise<AuthenticationResponse>
  authenticate(provider: string, authData: AuthenticationInput): Promise<AuthenticationResponse>
  updateProvider(provider: string, data: Record<string, unknown>): Promise<AuthenticationResponse>

  // AuthIdentity
  retrieveAuthIdentity(id: string, config?: FindConfig<AuthIdentityDTO>, context?: Context): Promise<AuthIdentityDTO>
  listAuthIdentities(
    filters?: FilterableAuthIdentityProps,
    config?: FindConfig<AuthIdentityDTO>,
    context?: Context,
  ): Promise<AuthIdentityDTO[]>
  listAndCountAuthIdentities(
    filters?: FilterableAuthIdentityProps,
    config?: FindConfig<AuthIdentityDTO>,
    context?: Context,
  ): Promise<[AuthIdentityDTO[], number]>
  createAuthIdentities(data: CreateAuthIdentityDTO[], context?: Context): Promise<AuthIdentityDTO[]>
  updateAuthIdentities(ids: string[], data: UpdateAuthIdentityDTO, context?: Context): Promise<AuthIdentityDTO[]>
  deleteAuthIdentities(ids: string[], context?: Context): Promise<void>
  softDeleteAuthIdentities(ids: string[], context?: Context): Promise<void>
  restoreAuthIdentities(ids: string[], context?: Context): Promise<void>

  // ProviderIdentity
  retrieveProviderIdentity(
    id: string,
    config?: FindConfig<ProviderIdentityDTO>,
    context?: Context,
  ): Promise<ProviderIdentityDTO>
  listProviderIdentities(
    filters?: FilterableProviderIdentityProps,
    config?: FindConfig<ProviderIdentityDTO>,
    context?: Context,
  ): Promise<ProviderIdentityDTO[]>
  listAndCountProviderIdentities(
    filters?: FilterableProviderIdentityProps,
    config?: FindConfig<ProviderIdentityDTO>,
    context?: Context,
  ): Promise<[ProviderIdentityDTO[], number]>
  createProviderIdentities(data: CreateProviderIdentityDTO[], context?: Context): Promise<ProviderIdentityDTO[]>
  updateProviderIdentities(
    ids: string[],
    data: UpdateProviderIdentityDTO,
    context?: Context,
  ): Promise<ProviderIdentityDTO[]>
  deleteProviderIdentities(ids: string[], context?: Context): Promise<void>
  softDeleteProviderIdentities(ids: string[], context?: Context): Promise<void>
  restoreProviderIdentities(ids: string[], context?: Context): Promise<void>

  // AuthVerification
  retrieveAuthVerification(
    id: string,
    config?: FindConfig<AuthVerificationDTO>,
    context?: Context,
  ): Promise<AuthVerificationDTO>
  listAuthVerifications(
    filters?: FilterableAuthVerificationProps,
    config?: FindConfig<AuthVerificationDTO>,
    context?: Context,
  ): Promise<AuthVerificationDTO[]>
  listAndCountAuthVerifications(
    filters?: FilterableAuthVerificationProps,
    config?: FindConfig<AuthVerificationDTO>,
    context?: Context,
  ): Promise<[AuthVerificationDTO[], number]>
  createAuthVerifications(data: CreateAuthVerificationDTO[], context?: Context): Promise<AuthVerificationDTO[]>
  updateAuthVerifications(
    ids: string[],
    data: UpdateAuthVerificationDTO,
    context?: Context,
  ): Promise<AuthVerificationDTO[]>
  deleteAuthVerifications(ids: string[], context?: Context): Promise<void>
  softDeleteAuthVerifications(ids: string[], context?: Context): Promise<void>
  restoreAuthVerifications(ids: string[], context?: Context): Promise<void>

  // AuthPasswordResetToken (hard-delete only)
  createAuthPasswordResetToken(
    data: CreateAuthPasswordResetTokenDTO,
    context?: Context,
  ): Promise<AuthPasswordResetTokenDTO>
  findAuthPasswordResetTokenByHash(tokenHash: string, context?: Context): Promise<AuthPasswordResetTokenDTO | null>
  deleteAuthPasswordResetTokensByProviderIdentity(providerIdentityId: string, context?: Context): Promise<void>
  hardDeleteAuthPasswordResetToken(id: string, context?: Context): Promise<void>
}
