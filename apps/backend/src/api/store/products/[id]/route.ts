import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { IdParams, StoreProductResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

export const GetInput = { params: IdParams }
export const GetOutput = StoreProductResponse

export const GET = async (req: HttpRequest<typeof GetInput>): Promise<HttpResult<typeof GetOutput>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)

  const [product, variants] = await Promise.all([
    productService.retrieveProduct(req.params.id),
    productService.listProductVariants({ productId: req.params.id }),
  ])

  return { status: 200, json: { product: { ...product, variants } } }
}
