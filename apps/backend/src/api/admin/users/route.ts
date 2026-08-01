import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IUserModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateUserBody,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserResponse,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type ListUsersInput = { query: AdminUserListQuery }
export const GET = async (req: HttpRequest<ListUsersInput>): Promise<HttpResult<AdminUserListResponse>> => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const { pagination, filters } = req.validatedQuery
  const [users, count] = await userService.listAndCountUsers(filters, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { users, count, offset, limit } }
}

type CreateUserInput = { body: AdminCreateUserBody }
export const POST = async (req: HttpRequest<CreateUserInput>): Promise<HttpResult<AdminUserResponse>> => {
  const userService = req.scope.resolve<IUserModuleService>(Modules.USER)
  const [user] = await userService.createUsers([req.body])
  if (!user) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'User not returned after create' })
  return { status: 201, json: { user } }
}
