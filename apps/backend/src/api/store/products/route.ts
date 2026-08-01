import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { StoreProductListQuery, StoreProductListResponse } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type ListInput = { query: StoreProductListQuery }
export const GET = async (req: HttpRequest<ListInput>): Promise<HttpResult<StoreProductListResponse>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const { pagination, filters } = req.validatedQuery
  const [products, count] = await productService.listAndCountProducts({ ...filters, status: 'published' }, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { products, count, offset, limit } }
}
