import { generateJwtTokenForAuthIdentity, getAuthJwtConfig } from '@core/auth/utils/generate-jwt-token.js'
import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IAuthModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AuthBody, AuthParams, AuthTokenResponse } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type RegisterInput = { body: AuthBody; params: AuthParams }

export const POST = async (req: HttpRequest<RegisterInput>): Promise<HttpResult<AuthTokenResponse>> => {
  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
  const { actorType, authProvider } = req.params

  const result = await authService.register(authProvider, { body: req.body })
  if (!result.success || !result.authIdentity) {
    throw new AppError({ type: ErrorTypes.INVALID_DATA, message: result.error ?? 'Registration failed' })
  }

  const token = generateJwtTokenForAuthIdentity(
    { authIdentity: result.authIdentity, actorType, authProvider },
    getAuthJwtConfig(),
    { actorless: true },
  )

  return { status: 200, json: { token } }
}
