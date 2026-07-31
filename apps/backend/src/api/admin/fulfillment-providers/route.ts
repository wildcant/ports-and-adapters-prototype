import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const fulfillmentProviders = await service.listFulfillmentProviders()
  return { status: 200, json: { fulfillmentProviders } } satisfies HttpResult
}
