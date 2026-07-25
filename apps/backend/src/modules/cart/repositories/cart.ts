import { BaseRepository } from '../../../core/utils/base-repository.js'
import { cartTable } from '../models/cart.js'

export class CartRepository extends BaseRepository(cartTable) {}
