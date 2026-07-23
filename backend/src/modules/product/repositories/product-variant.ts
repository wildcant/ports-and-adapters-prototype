import { BaseRepository } from '../../../core/utils/base-repository.js'
import { productVariantTable } from '../models/product-variant.js'

export class ProductVariantRepository extends BaseRepository(productVariantTable) {}
