import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { AdminInviteResponse, IdParams } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

export const PostInput = { params: IdParams }
export const PostOutput = AdminInviteResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const [invite] = await userService.refreshInviteTokens([req.params.id])
  if (!invite) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Invite with id "${req.params.id}" not found` })
  }
  return { status: 200, json: { invite } }
}
