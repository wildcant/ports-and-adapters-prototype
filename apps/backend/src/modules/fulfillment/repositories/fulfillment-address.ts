import { BaseRepository } from '../../../core/utils/base-repository.js'
import { fulfillmentAddressTable } from '../models/fulfillment-address.js'

export class FulfillmentAddressRepository extends BaseRepository(fulfillmentAddressTable) {}
