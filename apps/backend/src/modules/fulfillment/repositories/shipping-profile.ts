import { BaseRepository } from '../../../core/utils/base-repository.js'
import { shippingProfileTable } from '../models/shipping-profile.js'

export class ShippingProfileRepository extends BaseRepository(shippingProfileTable) {}
