import { Module } from '../../core/utils/module.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { AuthIdentityRepository } from './repositories/auth-identity.js'
import { AuthPasswordResetTokenRepository } from './repositories/auth-password-reset-token.js'
import { AuthVerificationRepository } from './repositories/auth-verification.js'
import { ProviderIdentityRepository } from './repositories/provider-identity.js'
import { AuthModuleService } from './services/auth-module-service.js'

export default Module(Modules.AUTH, {
  service: AuthModuleService,
  repositories: {
    authIdentityRepository: AuthIdentityRepository,
    providerIdentityRepository: ProviderIdentityRepository,
    authVerificationRepository: AuthVerificationRepository,
    authPasswordResetTokenRepository: AuthPasswordResetTokenRepository,
  },
})
