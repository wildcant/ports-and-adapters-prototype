import { BaseRepository } from '../../../core/utils/base-repository.js'
import { paymentTable } from '../models/payment.js'

export class PaymentRepository extends BaseRepository(paymentTable) {}
