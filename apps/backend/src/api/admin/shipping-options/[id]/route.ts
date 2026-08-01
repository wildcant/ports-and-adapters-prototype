import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminShippingOptionResponse,
  AdminUpdateShippingOptionBody,
  AdminUpdateShippingOptionResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type GetInput = { params: IdParams }

export const GET = async (req: HttpRequest<GetInput>): Promise<HttpResult<AdminShippingOptionResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const shippingOption = await service.retrieveShippingOption(req.params.id)
  return { status: 200, json: { shippingOption } }
}

type PostInput = { params: IdParams; body: AdminUpdateShippingOptionBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminUpdateShippingOptionResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [shippingOption] = await service.updateShippingOptions([req.params.id], req.body)
  if (!shippingOption) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Shipping option with id "${req.params.id}" not found` })
  }
  return { status: 200, json: { shippingOption } }
}

type DeleteInput = { params: IdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>): Promise<HttpResult<DeleteResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.softDeleteShippingOptions([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
