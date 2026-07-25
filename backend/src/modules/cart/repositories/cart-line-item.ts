import { BaseRepository } from '../../../core/utils/base-repository.js'
import { cartLineItemTable } from '../models/line-item.js'

export class CartLineItemRepository extends BaseRepository(cartLineItemTable) {}
