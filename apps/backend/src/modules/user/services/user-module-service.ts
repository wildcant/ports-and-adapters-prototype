import type {
  Context,
  CreateUserDTO,
  FilterableUserProps,
  FindConfig,
  IUserModuleService,
  UpdateUserDTO,
  UserDTO,
} from '../../../core/types/index.js'
import type { Logger } from '../../../core/types/logger.js'
import type { WithTransaction } from '../../../core/utils/with-transaction.js'
import type { UserRepository } from '../repositories/user.js'

type InjectedDependencies = {
  userRepository: UserRepository
  withTransaction: WithTransaction
  logger: Logger
}

export class UserModuleService implements IUserModuleService {
  private userRepository: UserRepository
  private withTransaction: WithTransaction
  private logger: Logger

  constructor({ userRepository, withTransaction, logger }: InjectedDependencies) {
    this.userRepository = userRepository
    this.withTransaction = withTransaction
    this.logger = logger
  }

  async retrieveUser(userId: string, config?: FindConfig<UserDTO>, context?: Context): Promise<UserDTO> {
    return this.userRepository.findByIdOrFail(userId, config, context)
  }

  async listUsers(filters?: FilterableUserProps, config?: FindConfig<UserDTO>, context?: Context): Promise<UserDTO[]> {
    return this.userRepository.find(filters, config, context)
  }

  async listAndCountUsers(
    filters?: FilterableUserProps,
    config?: FindConfig<UserDTO>,
    context?: Context,
  ): Promise<[UserDTO[], number]> {
    const [rows, count] = await this.userRepository.findAndCount(filters, config, context)
    return [rows, count]
  }

  async createUsers(data: CreateUserDTO[], context?: Context): Promise<UserDTO[]> {
    this.logger.debug(`Creating ${data.length} user(s)`)
    return this.withTransaction(context, async (ctx) => {
      return this.userRepository.createMany(data, ctx)
    })
  }

  async updateUsers(userIds: string[], data: UpdateUserDTO, context?: Context): Promise<UserDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.userRepository.update(userIds, data, ctx)
    })
  }

  async deleteUsers(userIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.userRepository.delete(userIds, ctx)
    })
  }

  async softDeleteUsers(userIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.userRepository.softDelete(userIds, ctx)
    })
  }

  async restoreUsers(userIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.userRepository.restore(userIds, ctx)
    })
  }
}
