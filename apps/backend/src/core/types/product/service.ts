import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type {
  FilterableProductProps,
  FilterableProductVariantProps,
  ProductDTO,
  ProductImageDTO,
  ProductOptionDTO,
  ProductOptionValueDTO,
  ProductVariantDTO,
} from './common.js'
import type {
  CreateProductDTO,
  CreateProductImageDTO,
  CreateProductOptionDTO,
  CreateProductOptionValueDTO,
  CreateProductVariantDTO,
  UpdateProductDTO,
} from './mutations.js'

export type IProductModuleService = {
  listProducts(
    filters?: FilterableProductProps,
    config?: FindConfig<ProductDTO>,
    context?: Context,
  ): Promise<ProductDTO[]>
  retrieveProduct(productId: string, config?: FindConfig<ProductDTO>, context?: Context): Promise<ProductDTO>
  createProducts(data: CreateProductDTO[], context?: Context): Promise<ProductDTO[]>
  updateProducts(productIds: string[], data: UpdateProductDTO, context?: Context): Promise<ProductDTO[]>
  deleteProducts(productIds: string[], context?: Context): Promise<void>
  createProductVariants(data: CreateProductVariantDTO[], context?: Context): Promise<ProductVariantDTO[]>
  createProductOptions(data: CreateProductOptionDTO[], context?: Context): Promise<ProductOptionDTO[]>
  createProductOptionValues(data: CreateProductOptionValueDTO[], context?: Context): Promise<ProductOptionValueDTO[]>
  createProductImages(data: CreateProductImageDTO[], context?: Context): Promise<ProductImageDTO[]>
  listProductVariants(
    filters?: FilterableProductVariantProps,
    config?: FindConfig<ProductVariantDTO>,
    context?: Context,
  ): Promise<ProductVariantDTO[]>
}
