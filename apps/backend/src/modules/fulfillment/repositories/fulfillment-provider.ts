import { BaseRepository } from '../../../core/utils/base-repository.js'
import { fulfillmentProviderTable } from '../models/fulfillment-provider.js'

export class FulfillmentProviderRepository extends BaseRepository(fulfillmentProviderTable) {}
