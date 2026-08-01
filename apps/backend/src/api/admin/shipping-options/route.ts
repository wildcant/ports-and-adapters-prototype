import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateShippingOptionBody,
  AdminCreateShippingOptionResponse,
  AdminShippingOptionListResponse,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult<AdminShippingOptionListResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const shippingOptions = await service.listShippingOptions()
  return { status: 200, json: { shippingOptions } }
}

type PostInput = { body: AdminCreateShippingOptionBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminCreateShippingOptionResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingOption] = await service.createShippingOptions([req.body])
  if (!shippingOption) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Shipping option not returned after create' })
  }
  return { status: 201, json: { shippingOption } }
}
