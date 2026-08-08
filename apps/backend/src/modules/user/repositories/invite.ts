import { BaseRepository } from '../../../core/utils/base-repository.js'
import { inviteTable } from '../models/invite.js'

export class InviteRepository extends BaseRepository(inviteTable) {}
