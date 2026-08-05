import { generateResetJwtToken, getAuthJwtConfig } from '@core/auth/utils/generate-jwt-token.js'
import { AppError } from '@core/errors/app-error.js'
import type { IAuthModuleService } from '@core/types/index.js'
import type { Logger } from '@core/types/logger.js'
import { ContainerRegistrationKeys, Modules } from '@core/utils/index.js'
import type { AuthParams, ResetPasswordBody, ResetPasswordResponse } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type ResetPasswordInput = { body: ResetPasswordBody; params: AuthParams }

export const POST = async (req: HttpRequest<ResetPasswordInput>): Promise<HttpResult<ResetPasswordResponse>> => {
  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
  const logger = req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
  const { actorType, authProvider } = req.params
  const { email } = req.body

  try {
    const result = await authService.createPasswordResetToken({
      provider: authProvider,
      entityId: email,
    })

    const resetToken = generateResetJwtToken(
      {
        entityId: email,
        provider: authProvider,
        actorType,
        authIdentityId: result.providerIdentity.authIdentityId,
        jti: result.jti,
      },
      getAuthJwtConfig(),
    )

    // TODO: replace with notification module
    logger.info(`[password-reset] token for ${email}: ${resetToken}`)
  } catch (error) {
    // Swallow NOT_FOUND to prevent email enumeration
    if (!AppError.isError(error)) throw error
  }

  // Always return 201 regardless of whether the email exists (no enumeration)
  return { status: 201, json: {} }
}
