import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateProductVariantBody,
  AdminCreateProductVariantResponse,
  AdminProductVariantListQuery,
  AdminProductVariantListResponse,
  IdParams,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type ListVariantsInput = { params: IdParams; query: AdminProductVariantListQuery }
export const GET = async (
  req: HttpRequest<ListVariantsInput>,
): Promise<HttpResult<AdminProductVariantListResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const { pagination, filters } = req.validatedQuery
  const [variants, count] = await productService.listAndCountProductVariants(
    { ...filters, productId: req.params.id },
    pagination,
  )
  const { offset, limit } = pagination
  return { status: 200, json: { variants, count, offset, limit } }
}

type CreateVariantInput = { params: IdParams; body: AdminCreateProductVariantBody }
export const POST = async (
  req: HttpRequest<CreateVariantInput>,
): Promise<HttpResult<AdminCreateProductVariantResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const [variant] = await productService.createProductVariants([{ ...req.body, productId: req.params.id }])
  if (!variant) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Variant not returned after create' })
  return { status: 201, json: { variant } }
}
