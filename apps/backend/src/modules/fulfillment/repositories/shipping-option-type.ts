import { BaseRepository } from '../../../core/utils/base-repository.js'
import { shippingOptionTypeTable } from '../models/shipping-option-type.js'

export class ShippingOptionTypeRepository extends BaseRepository(shippingOptionTypeTable) {}
