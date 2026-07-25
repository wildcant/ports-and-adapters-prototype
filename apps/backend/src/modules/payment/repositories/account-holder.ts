import { BaseRepository } from '../../../core/utils/base-repository.js'
import { accountHolderTable } from '../models/account-holder.js'

export class AccountHolderRepository extends BaseRepository(accountHolderTable) {}
