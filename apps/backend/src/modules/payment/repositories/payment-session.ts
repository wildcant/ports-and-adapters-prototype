import { BaseRepository } from '../../../core/utils/base-repository.js'
import { paymentSessionTable } from '../models/payment-session.js'

export class PaymentSessionRepository extends BaseRepository(paymentSessionTable) {}
