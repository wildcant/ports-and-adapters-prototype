import { BaseRepository } from '../../../core/utils/base-repository.js'
import { paymentProviderTable } from '../models/payment-provider.js'

export class PaymentProviderRepository extends BaseRepository(paymentProviderTable) {}
