import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { CreateShippingOptionBody } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const shippingOptions = await service.listShippingOptions()
  return { status: 200, json: { shippingOptions } } satisfies HttpResult
}

type PostInput = { body: CreateShippingOptionBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingOption] = await service.createShippingOptions([req.body])
  return { status: 201, json: { shippingOption } } satisfies HttpResult
}
