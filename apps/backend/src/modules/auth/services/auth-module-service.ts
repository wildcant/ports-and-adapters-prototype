import { AppError, ErrorTypes } from '../../../core/errors/index.js'
import type {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityDTO,
  AuthIdentityProviderService,
  AuthPasswordResetTokenDTO,
  AuthVerificationDTO,
  Context,
  CreateAuthIdentityDTO,
  CreateAuthPasswordResetTokenDTO,
  CreateAuthVerificationDTO,
  CreateProviderIdentityDTO,
  FilterableAuthIdentityProps,
  FilterableAuthVerificationProps,
  FilterableProviderIdentityProps,
  FindConfig,
  IAuthModuleService,
  ProviderIdentityDTO,
  UpdateAuthIdentityDTO,
  UpdateAuthVerificationDTO,
  UpdateProviderIdentityDTO,
} from '../../../core/types/index.js'
import type { Logger } from '../../../core/types/logger.js'
import type { WithTransaction } from '../../../core/utils/with-transaction.js'
import type { AuthIdentityRepository } from '../repositories/auth-identity.js'
import type { AuthPasswordResetTokenRepository } from '../repositories/auth-password-reset-token.js'
import type { AuthVerificationRepository } from '../repositories/auth-verification.js'
import type { ProviderIdentityRepository } from '../repositories/provider-identity.js'
import type { AuthProviderService } from './auth-provider-service.js'

type InjectedDependencies = {
  authIdentityRepository: AuthIdentityRepository
  providerIdentityRepository: ProviderIdentityRepository
  authVerificationRepository: AuthVerificationRepository
  authPasswordResetTokenRepository: AuthPasswordResetTokenRepository
  authProviderService: AuthProviderService
  withTransaction: WithTransaction
  logger: Logger
}

export class AuthModuleService implements IAuthModuleService {
  private authIdentityRepository: AuthIdentityRepository
  private providerIdentityRepository: ProviderIdentityRepository
  private authVerificationRepository: AuthVerificationRepository
  private authPasswordResetTokenRepository: AuthPasswordResetTokenRepository
  private authProviderService: AuthProviderService
  private withTransaction: WithTransaction
  private logger: Logger

  constructor({
    authIdentityRepository,
    providerIdentityRepository,
    authVerificationRepository,
    authPasswordResetTokenRepository,
    authProviderService,
    withTransaction,
    logger,
  }: InjectedDependencies) {
    this.authIdentityRepository = authIdentityRepository
    this.providerIdentityRepository = providerIdentityRepository
    this.authVerificationRepository = authVerificationRepository
    this.authPasswordResetTokenRepository = authPasswordResetTokenRepository
    this.authProviderService = authProviderService
    this.withTransaction = withTransaction
    this.logger = logger
  }

  async register(provider: string, authData: AuthenticationInput): Promise<AuthenticationResponse> {
    return this.authProviderService.register(provider, authData, this.getAuthIdentityProviderService(provider))
  }

  async authenticate(provider: string, authData: AuthenticationInput): Promise<AuthenticationResponse> {
    return this.authProviderService.authenticate(provider, authData, this.getAuthIdentityProviderService(provider))
  }

  async updateProvider(provider: string, data: Record<string, unknown>): Promise<AuthenticationResponse> {
    return this.authProviderService.update(provider, data, this.getAuthIdentityProviderService(provider))
  }

  async validateAuthIdentity(
    authIdentityId: string,
    provider: string,
  ): Promise<{ authIdentity: AuthIdentityDTO & { providerIdentities: ProviderIdentityDTO[] } }> {
    const authIdentity = await this.authIdentityRepository.findByIdOrFail(authIdentityId)
    const providerIdentities = await this.providerIdentityRepository.find({ authIdentityId: authIdentity.id, provider })

    if (providerIdentities.length === 0) {
      throw new AppError({ type: ErrorTypes.NOT_FOUND, message: 'Provider identity not found' })
    }

    return { authIdentity: { ...authIdentity, providerIdentities } }
  }

  /**
   * Build a scoped service that auth providers use to read/write identities.
   * This keeps providers decoupled from repositories — they only see
   * retrieve/create/update, scoped to a single provider string.
   */
  getAuthIdentityProviderService(provider: string): AuthIdentityProviderService {
    return {
      retrieve: async ({ entityId }) => {
        const results = await this.providerIdentityRepository.find({ entityId, provider }, { limit: 1 })
        const providerIdentity = results[0]
        if (!providerIdentity) return null

        const authIdentity = await this.authIdentityRepository.findByIdOrFail(providerIdentity.authIdentityId)
        return { authIdentity, providerIdentity }
      },

      create: async ({ entityId, providerMetadata, appMetadata }) => {
        return this.withTransaction(undefined, async (ctx) => {
          const authIdentities = await this.authIdentityRepository.createMany(
            [{ appMetadata: appMetadata ?? null }],
            ctx,
          )
          const authIdentity = authIdentities[0]
          if (!authIdentity)
            throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Expected auth identity to be created' })
          const providerIdentities = await this.providerIdentityRepository.createMany(
            [{ authIdentityId: authIdentity.id, entityId, provider, providerMetadata: providerMetadata ?? null }],
            ctx,
          )
          const providerIdentity = providerIdentities[0]
          if (!providerIdentity)
            throw new AppError({
              type: ErrorTypes.UNEXPECTED_STATE,
              message: 'Expected provider identity to be created',
            })
          return { authIdentity, providerIdentity }
        })
      },

      update: async (entityId, data) => {
        return this.withTransaction(undefined, async (ctx) => {
          const results = await this.providerIdentityRepository.find({ entityId, provider }, { limit: 1 }, ctx)
          const existing = results[0]
          if (!existing) {
            throw new AppError({ type: ErrorTypes.NOT_FOUND, message: 'Provider identity not found' })
          }

          const updatedProviderIdentities = await this.providerIdentityRepository.update(
            [existing.id],
            { providerMetadata: data.providerMetadata },
            ctx,
          )
          const providerIdentity = updatedProviderIdentities[0]
          if (!providerIdentity)
            throw new AppError({
              type: ErrorTypes.UNEXPECTED_STATE,
              message: 'Expected provider identity to be updated',
            })

          let authIdentity: AuthIdentityDTO
          if (data.appMetadata !== undefined) {
            const updatedAuthIdentities = await this.authIdentityRepository.update(
              [existing.authIdentityId],
              { appMetadata: data.appMetadata },
              ctx,
            )
            const updated = updatedAuthIdentities[0]
            if (!updated)
              throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Expected auth identity to be updated' })
            authIdentity = updated
          } else {
            authIdentity = await this.authIdentityRepository.findByIdOrFail(existing.authIdentityId, undefined, ctx)
          }

          return { authIdentity, providerIdentity }
        })
      },
    }
  }

  // --- AuthIdentity ---

  async retrieveAuthIdentity(
    id: string,
    config?: FindConfig<AuthIdentityDTO>,
    context?: Context,
  ): Promise<AuthIdentityDTO> {
    return this.authIdentityRepository.findByIdOrFail(id, config, context)
  }

  async listAuthIdentities(
    filters?: FilterableAuthIdentityProps,
    config?: FindConfig<AuthIdentityDTO>,
    context?: Context,
  ): Promise<AuthIdentityDTO[]> {
    return this.authIdentityRepository.find(filters, config, context)
  }

  async listAndCountAuthIdentities(
    filters?: FilterableAuthIdentityProps,
    config?: FindConfig<AuthIdentityDTO>,
    context?: Context,
  ): Promise<[AuthIdentityDTO[], number]> {
    return this.authIdentityRepository.findAndCount(filters, config, context)
  }

  async createAuthIdentities(data: CreateAuthIdentityDTO[], context?: Context): Promise<AuthIdentityDTO[]> {
    this.logger.debug(`Creating ${data.length} auth identity(ies)`)
    return this.withTransaction(context, async (ctx) => {
      return this.authIdentityRepository.createMany(data, ctx)
    })
  }

  async updateAuthIdentities(
    ids: string[],
    data: UpdateAuthIdentityDTO,
    context?: Context,
  ): Promise<AuthIdentityDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.authIdentityRepository.update(ids, data, ctx)
    })
  }

  async deleteAuthIdentities(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authIdentityRepository.delete(ids, ctx)
    })
  }

  async softDeleteAuthIdentities(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authIdentityRepository.softDelete(ids, ctx)
    })
  }

  async restoreAuthIdentities(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authIdentityRepository.restore(ids, ctx)
    })
  }

  // --- ProviderIdentity ---

  async retrieveProviderIdentity(
    id: string,
    config?: FindConfig<ProviderIdentityDTO>,
    context?: Context,
  ): Promise<ProviderIdentityDTO> {
    return this.providerIdentityRepository.findByIdOrFail(id, config, context)
  }

  async listProviderIdentities(
    filters?: FilterableProviderIdentityProps,
    config?: FindConfig<ProviderIdentityDTO>,
    context?: Context,
  ): Promise<ProviderIdentityDTO[]> {
    return this.providerIdentityRepository.find(filters, config, context)
  }

  async listAndCountProviderIdentities(
    filters?: FilterableProviderIdentityProps,
    config?: FindConfig<ProviderIdentityDTO>,
    context?: Context,
  ): Promise<[ProviderIdentityDTO[], number]> {
    return this.providerIdentityRepository.findAndCount(filters, config, context)
  }

  async createProviderIdentities(data: CreateProviderIdentityDTO[], context?: Context): Promise<ProviderIdentityDTO[]> {
    this.logger.debug(`Creating ${data.length} provider identity(ies)`)
    return this.withTransaction(context, async (ctx) => {
      return this.providerIdentityRepository.createMany(data, ctx)
    })
  }

  async updateProviderIdentities(
    ids: string[],
    data: UpdateProviderIdentityDTO,
    context?: Context,
  ): Promise<ProviderIdentityDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.providerIdentityRepository.update(ids, data, ctx)
    })
  }

  async deleteProviderIdentities(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.providerIdentityRepository.delete(ids, ctx)
    })
  }

  async softDeleteProviderIdentities(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.providerIdentityRepository.softDelete(ids, ctx)
    })
  }

  async restoreProviderIdentities(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.providerIdentityRepository.restore(ids, ctx)
    })
  }

  // --- AuthVerification ---

  async retrieveAuthVerification(
    id: string,
    config?: FindConfig<AuthVerificationDTO>,
    context?: Context,
  ): Promise<AuthVerificationDTO> {
    return this.authVerificationRepository.findByIdOrFail(id, config, context)
  }

  async listAuthVerifications(
    filters?: FilterableAuthVerificationProps,
    config?: FindConfig<AuthVerificationDTO>,
    context?: Context,
  ): Promise<AuthVerificationDTO[]> {
    return this.authVerificationRepository.find(filters, config, context)
  }

  async listAndCountAuthVerifications(
    filters?: FilterableAuthVerificationProps,
    config?: FindConfig<AuthVerificationDTO>,
    context?: Context,
  ): Promise<[AuthVerificationDTO[], number]> {
    return this.authVerificationRepository.findAndCount(filters, config, context)
  }

  async createAuthVerifications(data: CreateAuthVerificationDTO[], context?: Context): Promise<AuthVerificationDTO[]> {
    this.logger.debug(`Creating ${data.length} auth verification(s)`)
    return this.withTransaction(context, async (ctx) => {
      return this.authVerificationRepository.createMany(data, ctx)
    })
  }

  async updateAuthVerifications(
    ids: string[],
    data: UpdateAuthVerificationDTO,
    context?: Context,
  ): Promise<AuthVerificationDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.authVerificationRepository.update(ids, data, ctx)
    })
  }

  async deleteAuthVerifications(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authVerificationRepository.delete(ids, ctx)
    })
  }

  async softDeleteAuthVerifications(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authVerificationRepository.softDelete(ids, ctx)
    })
  }

  async restoreAuthVerifications(ids: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authVerificationRepository.restore(ids, ctx)
    })
  }

  // --- AuthPasswordResetToken (hard-delete only) ---

  async createAuthPasswordResetToken(
    data: CreateAuthPasswordResetTokenDTO,
    context?: Context,
  ): Promise<AuthPasswordResetTokenDTO> {
    this.logger.debug('Creating auth password reset token')
    return this.withTransaction(context, async (ctx) => {
      return this.authPasswordResetTokenRepository.create(data, ctx)
    })
  }

  async findAuthPasswordResetTokenByHash(
    tokenHash: string,
    context?: Context,
  ): Promise<AuthPasswordResetTokenDTO | null> {
    return this.authPasswordResetTokenRepository.findByTokenHash(tokenHash, context)
  }

  async deleteAuthPasswordResetTokensByProviderIdentity(providerIdentityId: string, context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authPasswordResetTokenRepository.deleteByProviderIdentityId(providerIdentityId, ctx)
    })
  }

  async hardDeleteAuthPasswordResetToken(id: string, context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.authPasswordResetTokenRepository.hardDelete([id], ctx)
    })
  }
}
