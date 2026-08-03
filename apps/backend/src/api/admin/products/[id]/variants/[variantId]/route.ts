import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminProductVariantResponse,
  AdminUpdateProductVariantBody,
  AdminUpdateProductVariantResponse,
  DeleteResponse,
  VariantIdParams,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

type RetrieveVariantInput = { params: VariantIdParams }
export const GET = async (req: HttpRequest<RetrieveVariantInput>): Promise<HttpResult<AdminProductVariantResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const variant = await productService.retrieveProductVariant(req.params.variantId)
  return { status: 200, json: { variant } }
}

type UpdateVariantInput = { params: VariantIdParams; body: AdminUpdateProductVariantBody }
export const PATCH = async (
  req: HttpRequest<UpdateVariantInput>,
): Promise<HttpResult<AdminUpdateProductVariantResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const [variant] = await productService.updateProductVariants([req.params.variantId], req.body)
  if (!variant) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Variant with id "${req.params.variantId}" not found` })
  }
  return { status: 200, json: { variant } }
}

type DeleteVariantInput = { params: VariantIdParams }
export const DELETE = async (req: HttpRequest<DeleteVariantInput>): Promise<HttpResult<DeleteResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  await productService.deleteProductVariants([req.params.variantId])
  return { status: 200, json: { id: req.params.variantId, deleted: true } }
}
