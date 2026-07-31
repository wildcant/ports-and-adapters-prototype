import { BaseRepository } from '../../../core/utils/base-repository.js'
import { fulfillmentItemTable } from '../models/fulfillment-item.js'

export class FulfillmentItemRepository extends BaseRepository(fulfillmentItemTable) {}
