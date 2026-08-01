import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminUpdateShippingProfileBody, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type PostInput = { params: IdParams; body: AdminUpdateShippingProfileBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingProfile] = await service.updateShippingProfiles([req.params.id], req.body)
  return { status: 200, json: { shippingProfile } } satisfies HttpResult
}

type DeleteInput = { params: IdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.deleteShippingProfiles([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } } satisfies HttpResult
}
