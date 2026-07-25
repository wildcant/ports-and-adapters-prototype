import { BaseRepository } from '../../../core/utils/base-repository.js'
import { userTable } from '../models/user.js'

export class UserRepository extends BaseRepository(userTable) {}
