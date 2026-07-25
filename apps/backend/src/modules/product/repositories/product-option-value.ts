import { BaseRepository } from '../../../core/utils/base-repository.js'
import { productOptionValueTable } from '../models/product-option-value.js'

export class ProductOptionValueRepository extends BaseRepository(productOptionValueTable) {}
