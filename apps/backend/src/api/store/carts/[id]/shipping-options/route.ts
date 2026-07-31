import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type GetInput = { params: IdParams }

function str(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val
}

export const GET = async (req: HttpRequest<GetInput>) => {
  const countryCode = str(req.query.country_code)

  if (!countryCode) {
    return { status: 200, json: { shippingOptions: [] } } satisfies HttpResult
  }

  const fulfillmentService = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)

  const shippingOptions = await fulfillmentService.listShippingOptionsForContext({
    countryCode,
    province: str(req.query.province),
    city: str(req.query.city),
    postalCode: str(req.query.postal_code),
  })

  return { status: 200, json: { shippingOptions } } satisfies HttpResult
}
