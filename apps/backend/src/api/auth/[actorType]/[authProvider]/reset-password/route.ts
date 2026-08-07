import { generateResetJwtToken, getAuthJwtConfig } from '@core/auth/utils/generate-jwt-token.js'
import { AppError } from '@core/errors/app-error.js'
import type { IAuthModuleService } from '@core/types/index.js'
import type { Logger } from '@core/types/logger.js'
import { ContainerRegistrationKeys, Modules } from '@core/utils/index.js'
import { AuthParams, ResetPasswordBody, ResetPasswordResponse } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

export const PostInput = { body: ResetPasswordBody, params: AuthParams }
export const PostOutput = ResetPasswordResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
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
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`
    logger.debug(`[password-reset] reset link for ${email}: ${resetLink}`)
  } catch (error) {
    // Swallow NOT_FOUND to prevent email enumeration
    if (!AppError.isError(error)) throw error
  }

  // Always return 201 regardless of whether the email exists (no enumeration)
  return { status: 201, json: {} }
}
