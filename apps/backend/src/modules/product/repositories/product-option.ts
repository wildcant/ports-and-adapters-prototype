import { BaseRepository } from '../../../core/utils/base-repository.js'
import { productOptionTable } from '../models/product-option.js'

export class ProductOptionRepository extends BaseRepository(productOptionTable) {}
