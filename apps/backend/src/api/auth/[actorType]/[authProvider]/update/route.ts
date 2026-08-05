import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IAuthModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AuthParams, UpdatePasswordBody, UpdatePasswordResponse } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type UpdatePasswordInput = { body: UpdatePasswordBody; params: AuthParams }

export const POST = async (req: HttpRequest<UpdatePasswordInput>): Promise<HttpResult<UpdatePasswordResponse>> => {
  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
  const { authProvider } = req.params

  if (!req.authContext) {
    throw new AppError({ type: ErrorTypes.UNAUTHORIZED, message: 'Unauthorized' })
  }

  // entity_id comes from the validated reset token, not from the request body
  const entityId = req.authContext.actorId

  const result = await authService.updateProvider(authProvider, {
    email: entityId,
    password: req.body.password,
  })

  if (!result.success) {
    throw new AppError({ type: ErrorTypes.INVALID_DATA, message: result.error ?? 'Password update failed' })
  }

  return { status: 200, json: { success: true } }
}
