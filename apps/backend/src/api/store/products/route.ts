import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const products = await productService.listProducts({ status: 'published' })

  return { status: 200, json: { products } } satisfies HttpResult
}
