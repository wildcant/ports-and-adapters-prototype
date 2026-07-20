import type { CreateUser } from '@core/http-schemas/index.js'
import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { z } from 'zod'
import type { HttpRequest, HttpResult } from '../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const users = await userService.listUsers()
  return { status: 200, json: { users } } satisfies HttpResult
}

export const POST = async (req: HttpRequest<z.infer<typeof CreateUser>>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const users = await userService.createUsers([req.body])
  return { status: 201, json: { user: users[0] } } satisfies HttpResult
}
