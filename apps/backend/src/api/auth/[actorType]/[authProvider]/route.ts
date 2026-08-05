import { generateJwtTokenWithChecks, getAuthJwtConfig } from '@core/auth/utils/generate-jwt-token.js'
import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IAuthModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AuthBody, AuthenticateResponse, AuthParams } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type AuthenticateInput = { body: AuthBody; params: AuthParams }

export const POST = async (req: HttpRequest<AuthenticateInput>): Promise<HttpResult<AuthenticateResponse>> => {
  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
  const { actorType, authProvider } = req.params

  const result = await authService.authenticate(authProvider, { body: req.body })
  if (!result.success || !result.authIdentity) {
    throw new AppError({ type: ErrorTypes.UNAUTHORIZED, message: result.error ?? 'Authentication failed' })
  }

  const tokenResult = await generateJwtTokenWithChecks(
    authService,
    {
      authIdentity: result.authIdentity,
      actorType,
      authProvider,
    },
    getAuthJwtConfig(),
  )

  return { status: 200, json: tokenResult }
}
