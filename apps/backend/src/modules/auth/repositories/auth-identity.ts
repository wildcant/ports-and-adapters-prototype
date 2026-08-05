import { BaseRepository } from '../../../core/utils/base-repository.js'
import { authIdentityTable } from '../models/auth-identity.js'

export class AuthIdentityRepository extends BaseRepository(authIdentityTable) {}
