import { BaseRepository } from '../../../core/utils/base-repository.js'
import { cartShippingMethodTable } from '../models/shipping-method.js'

export class CartShippingMethodRepository extends BaseRepository(cartShippingMethodTable) {}
