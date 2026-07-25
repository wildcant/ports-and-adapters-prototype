import type { IdParams } from '@core/http-schemas/common.js'
import type { UpdateUserBody } from '@core/http-schemas/user/payloads.js'
import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type RetrieveUserInput = { params: IdParams }
export const GET = async (req: HttpRequest<RetrieveUserInput>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const user = await userService.retrieveUser(req.params.id)
  return { status: 200, json: { user } } satisfies HttpResult
}

type UpdateUserInput = { params: IdParams; body: UpdateUserBody }
export const PATCH = async (req: HttpRequest<UpdateUserInput>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const [user] = await userService.updateUsers([req.params.id], req.body)
  return { status: 200, json: { user } } satisfies HttpResult
}

type DeleteUserInput = { params: IdParams }
export const DELETE = async (req: HttpRequest<DeleteUserInput>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  await userService.deleteUsers([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } } satisfies HttpResult
}
