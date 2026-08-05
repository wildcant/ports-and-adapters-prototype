import type {
  AuthIdentityDTO,
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

type InjectedDependencies = {
  authIdentityRepository: AuthIdentityRepository
  providerIdentityRepository: ProviderIdentityRepository
  authVerificationRepository: AuthVerificationRepository
  authPasswordResetTokenRepository: AuthPasswordResetTokenRepository
  withTransaction: WithTransaction
  logger: Logger
}

export class AuthModuleService implements IAuthModuleService {
  private authIdentityRepository: AuthIdentityRepository
  private providerIdentityRepository: ProviderIdentityRepository
  private authVerificationRepository: AuthVerificationRepository
  private authPasswordResetTokenRepository: AuthPasswordResetTokenRepository
  private withTransaction: WithTransaction
  private logger: Logger

  constructor({
    authIdentityRepository,
    providerIdentityRepository,
    authVerificationRepository,
    authPasswordResetTokenRepository,
    withTransaction,
    logger,
  }: InjectedDependencies) {
    this.authIdentityRepository = authIdentityRepository
    this.providerIdentityRepository = providerIdentityRepository
    this.authVerificationRepository = authVerificationRepository
    this.authPasswordResetTokenRepository = authPasswordResetTokenRepository
    this.withTransaction = withTransaction
    this.logger = logger
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
