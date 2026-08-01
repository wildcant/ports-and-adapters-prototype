import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminProductResponse,
  AdminUpdateProductBody,
  AdminUpdateProductResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type RetrieveProductInput = { params: IdParams }
export const GET = async (req: HttpRequest<RetrieveProductInput>): Promise<HttpResult<AdminProductResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const product = await productService.retrieveProduct(req.params.id)
  return { status: 200, json: { product } }
}

type UpdateProductInput = { params: IdParams; body: AdminUpdateProductBody }
export const PATCH = async (req: HttpRequest<UpdateProductInput>): Promise<HttpResult<AdminUpdateProductResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const [product] = await productService.updateProducts([req.params.id], req.body)
  if (!product) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Product with id "${req.params.id}" not found` })
  }
  return { status: 200, json: { product } }
}

type DeleteProductInput = { params: IdParams }
export const DELETE = async (req: HttpRequest<DeleteProductInput>): Promise<HttpResult<DeleteResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  await productService.deleteProducts([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
