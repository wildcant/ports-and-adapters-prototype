import { BaseRepository } from '../../../core/utils/base-repository.js'
import { productImageTable } from '../models/product-image.js'

export class ProductImageRepository extends BaseRepository(productImageTable) {}
