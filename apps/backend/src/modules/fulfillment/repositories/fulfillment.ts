import { BaseRepository } from '../../../core/utils/base-repository.js'
import { fulfillmentTable } from '../models/fulfillment.js'

export class FulfillmentRepository extends BaseRepository(fulfillmentTable) {}
