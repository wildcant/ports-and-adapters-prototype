import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminUpdateProductBody, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type RetrieveProductInput = { params: IdParams }
export const GET = async (req: HttpRequest<RetrieveProductInput>) => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const product = await productService.retrieveProduct(req.params.id)
  return { status: 200, json: { product } } satisfies HttpResult
}

type UpdateProductInput = { params: IdParams; body: AdminUpdateProductBody }
export const PATCH = async (req: HttpRequest<UpdateProductInput>) => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const [product] = await productService.updateProducts([req.params.id], req.body)
  return { status: 200, json: { product } } satisfies HttpResult
}

type DeleteProductInput = { params: IdParams }
export const DELETE = async (req: HttpRequest<DeleteProductInput>) => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  await productService.deleteProducts([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } } satisfies HttpResult
}
