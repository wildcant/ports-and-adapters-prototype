import { BaseRepository } from '../../../core/utils/base-repository.js'
import { paymentCollectionTable } from '../models/payment-collection.js'

export class PaymentCollectionRepository extends BaseRepository(paymentCollectionTable) {}
