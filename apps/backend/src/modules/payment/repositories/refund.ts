import { BaseRepository } from '../../../core/utils/base-repository.js'
import { refundTable } from '../models/refund.js'

export class RefundRepository extends BaseRepository(refundTable) {}
