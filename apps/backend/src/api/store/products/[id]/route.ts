import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { IdParams, StoreProductResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type Input = { params: IdParams }

export const GET = async (req: HttpRequest<Input>): Promise<HttpResult<StoreProductResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)

  const [product, variants] = await Promise.all([
    productService.retrieveProduct(req.params.id),
    productService.listProductVariants({ productId: req.params.id }),
  ])

  return { status: 200, json: { product: { ...product, variants } } }
}
