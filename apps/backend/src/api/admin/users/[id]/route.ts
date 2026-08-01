import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminUpdateUserBody, AdminUserResponse, DeleteResponse, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type RetrieveUserInput = { params: IdParams }
export const GET = async (req: HttpRequest<RetrieveUserInput>): Promise<HttpResult<AdminUserResponse>> => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const user = await userService.retrieveUser(req.params.id)
  return { status: 200, json: { user } }
}

type UpdateUserInput = { params: IdParams; body: AdminUpdateUserBody }
export const PATCH = async (req: HttpRequest<UpdateUserInput>): Promise<HttpResult<AdminUserResponse>> => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const [user] = await userService.updateUsers([req.params.id], req.body)
  if (!user) throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `User with id "${req.params.id}" not found` })
  return { status: 200, json: { user } }
}

type DeleteUserInput = { params: IdParams }
export const DELETE = async (req: HttpRequest<DeleteUserInput>): Promise<HttpResult<DeleteResponse>> => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  await userService.deleteUsers([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
