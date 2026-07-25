import { BaseRepository } from '../../../core/utils/base-repository.js'
import { refundReasonTable } from '../models/refund-reason.js'

export class RefundReasonRepository extends BaseRepository(refundReasonTable) {}
