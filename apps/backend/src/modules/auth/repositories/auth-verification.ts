import { BaseRepository } from '../../../core/utils/base-repository.js'
import { authVerificationTable } from '../models/auth-verification.js'

export class AuthVerificationRepository extends BaseRepository(authVerificationTable) {}
