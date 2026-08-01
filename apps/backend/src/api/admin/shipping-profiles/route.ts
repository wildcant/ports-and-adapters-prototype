import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateShippingProfileBody,
  AdminCreateShippingProfileResponse,
  AdminShippingProfileListResponse,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult<AdminShippingProfileListResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const shippingProfiles = await service.listShippingProfiles()
  return { status: 200, json: { shippingProfiles } }
}

type PostInput = { body: AdminCreateShippingProfileBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminCreateShippingProfileResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingProfile] = await service.createShippingProfiles([req.body])
  if (!shippingProfile) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Shipping profile not returned after create' })
  }
  return { status: 201, json: { shippingProfile } }
}
