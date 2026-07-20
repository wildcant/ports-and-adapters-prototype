import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type { FilterableUserProps, UserDTO } from './common.js'
import type { CreateUserDTO, UpdateUserDTO } from './mutations.js'

export type IUserModuleService = {
  retrieveUser(userId: string, config?: FindConfig<UserDTO>, context?: Context): Promise<UserDTO>
  listUsers(filters?: FilterableUserProps, config?: FindConfig<UserDTO>, context?: Context): Promise<UserDTO[]>
  listAndCountUsers(
    filters?: FilterableUserProps,
    config?: FindConfig<UserDTO>,
    context?: Context,
  ): Promise<[UserDTO[], number]>
  createUsers(data: CreateUserDTO[], context?: Context): Promise<UserDTO[]>
  updateUsers(userIds: string[], data: UpdateUserDTO, context?: Context): Promise<UserDTO[]>
  deleteUsers(userIds: string[], context?: Context): Promise<void>
  softDeleteUsers(userIds: string[], context?: Context): Promise<void>
  restoreUsers(userIds: string[], context?: Context): Promise<void>
}
