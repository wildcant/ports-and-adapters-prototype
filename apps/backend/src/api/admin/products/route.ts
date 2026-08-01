import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateProductBody,
  AdminCreateProductResponse,
  AdminProductListQuery,
  AdminProductListResponse,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type ListProductsInput = { query: AdminProductListQuery }
export const GET = async (req: HttpRequest<ListProductsInput>): Promise<HttpResult<AdminProductListResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const { pagination, filters } = req.validatedQuery
  const [products, count] = await productService.listAndCountProducts(filters, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { products, count, offset, limit } }
}

type CreateProductInput = { body: AdminCreateProductBody }
export const POST = async (req: HttpRequest<CreateProductInput>): Promise<HttpResult<AdminCreateProductResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const [product] = await productService.createProducts([req.body])
  if (!product) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Product not returned after create' })
  return { status: 201, json: { product } }
}
