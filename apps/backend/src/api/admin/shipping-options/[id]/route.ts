import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminUpdateShippingOptionBody, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type GetInput = { params: IdParams }

export const GET = async (req: HttpRequest<GetInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const shippingOption = await service.retrieveShippingOption(req.params.id)
  return { status: 200, json: { shippingOption } } satisfies HttpResult
}

type PostInput = { params: IdParams; body: AdminUpdateShippingOptionBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingOption] = await service.updateShippingOptions([req.params.id], req.body)
  return { status: 200, json: { shippingOption } } satisfies HttpResult
}

type DeleteInput = { params: IdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.softDeleteShippingOptions([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } } satisfies HttpResult
}
