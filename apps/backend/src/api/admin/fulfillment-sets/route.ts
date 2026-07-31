import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { CreateFulfillmentSetBody } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const fulfillmentSets = await service.listFulfillmentSets()
  return { status: 200, json: { fulfillmentSets } } satisfies HttpResult
}

type PostInput = { body: CreateFulfillmentSetBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [fulfillmentSet] = await service.createFulfillmentSets([req.body])
  return { status: 201, json: { fulfillmentSet } } satisfies HttpResult
}
