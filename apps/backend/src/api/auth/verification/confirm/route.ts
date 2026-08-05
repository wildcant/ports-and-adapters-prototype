import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IAuthModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { VerificationConfirmBody, VerificationConfirmResponse } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type ConfirmInput = { body: VerificationConfirmBody }

export const POST = async (req: HttpRequest<ConfirmInput>): Promise<HttpResult<VerificationConfirmResponse>> => {
  const authContext = req.authContext
  if (!authContext) {
    throw new AppError({ type: ErrorTypes.UNAUTHORIZED, message: 'Unauthorized' })
  }

  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

  const result = await authService.confirmAuthVerification({
    authIdentityId: authContext.authIdentityId,
    codeProvider: req.body.codeProvider,
    code: req.body.code,
  })

  const verifiedAt = result.verifiedAt
  if (!verifiedAt) {
    throw new AppError({
      type: ErrorTypes.UNEXPECTED_STATE,
      message: 'Expected verifiedAt to be set after confirmation',
    })
  }

  return {
    status: 200,
    json: {
      id: result.id,
      entityId: result.entityId,
      entityType: result.entityType,
      verifiedAt: verifiedAt.toISOString(),
    },
  }
}
