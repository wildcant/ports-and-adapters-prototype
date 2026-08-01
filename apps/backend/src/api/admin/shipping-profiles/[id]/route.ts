import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminUpdateShippingProfileBody,
  AdminUpdateShippingProfileResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type PostInput = { params: IdParams; body: AdminUpdateShippingProfileBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminUpdateShippingProfileResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingProfile] = await service.updateShippingProfiles([req.params.id], req.body)
  if (!shippingProfile) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Shipping profile with id "${req.params.id}" not found` })
  }
  return { status: 200, json: { shippingProfile } }
}

type DeleteInput = { params: IdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>): Promise<HttpResult<DeleteResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.deleteShippingProfiles([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
