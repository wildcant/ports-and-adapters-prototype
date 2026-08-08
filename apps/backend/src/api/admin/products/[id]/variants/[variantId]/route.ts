import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import {
  AdminProductVariantResponse,
  AdminUpdateProductVariant,
  AdminUpdateProductVariantResponse,
  DeleteResponse,
  VariantIdParams,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

export const GetInput = { params: VariantIdParams }
export const GetOutput = AdminProductVariantResponse

export const GET = async (req: HttpRequest<typeof GetInput>): Promise<HttpResult<typeof GetOutput>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const variant = await productService.retrieveProductVariant(req.params.variantId)
  return { status: 200, json: { variant } }
}

export const PatchInput = { params: VariantIdParams, body: AdminUpdateProductVariant }
export const PatchOutput = AdminUpdateProductVariantResponse

export const PATCH = async (req: HttpRequest<typeof PatchInput>): Promise<HttpResult<typeof PatchOutput>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const variant = await productService.updateProductVariant(req.params.variantId, req.body)
  return { status: 200, json: { variant } }
}

export const DeleteInput = { params: VariantIdParams }
export const DeleteOutput = DeleteResponse

export const DELETE = async (req: HttpRequest<typeof DeleteInput>): Promise<HttpResult<typeof DeleteOutput>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  await productService.deleteProductVariants([req.params.variantId])
  return { status: 200, json: { id: req.params.variantId, deleted: true } }
}
