import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  IdParams,
  StoreShippingOptionListQuery,
  StoreShippingOptionListResponse,
} from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type GetInput = { params: IdParams; query: StoreShippingOptionListQuery }

export const GET = async (req: HttpRequest<GetInput>): Promise<HttpResult<StoreShippingOptionListResponse>> => {
  const { countryCode, province, city, postalCode } = req.validatedQuery

  if (!countryCode) {
    return { status: 200, json: { shippingOptions: [] } }
  }

  const fulfillmentService = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)

  const shippingOptions = await fulfillmentService.listShippingOptionsForContext({
    countryCode,
    province,
    city,
    postalCode,
  })

  return { status: 200, json: { shippingOptions } }
}
