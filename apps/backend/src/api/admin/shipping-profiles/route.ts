import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCreateShippingProfileBody } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const shippingProfiles = await service.listShippingProfiles()
  return { status: 200, json: { shippingProfiles } } satisfies HttpResult
}

type PostInput = { body: AdminCreateShippingProfileBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingProfile] = await service.createShippingProfiles([req.body])
  return { status: 201, json: { shippingProfile } } satisfies HttpResult
}
