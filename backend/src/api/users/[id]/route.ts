import type { UpdateUser } from '@core/http-schemas/index.js'
import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { z } from 'zod'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const user = await userService.retrieveUser(req.params.id)
  return { status: 200, json: { user } } satisfies HttpResult
}

export const PATCH = async (req: HttpRequest<z.infer<typeof UpdateUser>>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const [user] = await userService.updateUsers([req.params.id], req.body)
  return { status: 200, json: { user } } satisfies HttpResult
}

export const DELETE = async (req: HttpRequest) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  await userService.deleteUsers([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } } satisfies HttpResult
}
