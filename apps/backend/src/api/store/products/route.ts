import type { IProductModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { StoreProductListParams, StoreProductListResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GetInput = { query: StoreProductListParams }
export const GetOutput = StoreProductListResponse

export const GET = async (req: HttpRequest<typeof GetInput>): Promise<HttpResult<typeof GetOutput>> => {
  const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)
  const { pagination, filters } = req.validatedQuery
  const [products, count] = await productService.listAndCountProducts({ ...filters, status: 'published' }, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { products, count, offset, limit } }
}
