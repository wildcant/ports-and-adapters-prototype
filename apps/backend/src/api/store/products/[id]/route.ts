import type { IdParams } from '@core/http-schemas/common.js'
import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type Input = { params: IdParams }

export const GET = async (req: HttpRequest<Input>) => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)

  const [product, variants] = await Promise.all([
    productService.retrieveProduct(req.params.id),
    productService.listProductVariants({ productId: req.params.id }),
  ])

  return { status: 200, json: { product: { ...product, variants } } } satisfies HttpResult
}
