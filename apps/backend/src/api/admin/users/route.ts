import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCreateUserBody, AdminUserListQuery } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type ListUsersInput = { query: AdminUserListQuery }
export const GET = async (req: HttpRequest<ListUsersInput>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const { pagination, filters } = req.validatedQuery
  const [users, count] = await userService.listAndCountUsers(filters, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { users, count, offset, limit } } satisfies HttpResult
}

type CreateUserInput = { body: AdminCreateUserBody }
export const POST = async (req: HttpRequest<CreateUserInput>) => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const users = await userService.createUsers([req.body])
  return { status: 201, json: { user: users[0] } } satisfies HttpResult
}
