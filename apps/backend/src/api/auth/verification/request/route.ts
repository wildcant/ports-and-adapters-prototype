import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IAuthModuleService, Logger } from '@core/types/index.js'
import { ContainerRegistrationKeys, Modules } from '@core/utils/index.js'
import type { VerificationRequestBody, VerificationRequestResponse } from '@proteus/http-schemas/auth'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type RequestInput = { body: VerificationRequestBody }
export const POST = async (req: HttpRequest<RequestInput>): Promise<HttpResult<VerificationRequestResponse>> => {
  const logger = req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
  const authContext = req.authContext
  if (!authContext) throw new AppError({ type: ErrorTypes.UNAUTHORIZED, message: 'Unauthorized' })

  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

  const result = await authService.requestAuthVerification({
    authIdentityId: authContext.authIdentityId,
    entityId: req.body.entityId,
    entityType: req.body.entityType,
    codeProvider: req.body.codeProvider,
    metadata: req.body.metadata,
  })

  logger.debug(`Verification code for ${result.entityId}: ${result.code}`)

  return {
    status: 200,
    json: {
      id: result.id,
      entityId: result.entityId,
      entityType: result.entityType,
      requestedAt: result.requestedAt.toISOString(),
    },
  }
}
