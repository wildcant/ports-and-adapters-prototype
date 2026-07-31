import { BaseRepository } from '../../../core/utils/base-repository.js'
import { fulfillmentSetTable } from '../models/fulfillment-set.js'

export class FulfillmentSetRepository extends BaseRepository(fulfillmentSetTable) {}
