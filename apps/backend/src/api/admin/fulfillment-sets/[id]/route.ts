import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminFulfillmentSetDetailResponse,
  AdminUpdateFulfillmentSetBody,
  AdminUpdateFulfillmentSetResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type GetInput = { params: IdParams }

export const GET = async (req: HttpRequest<GetInput>): Promise<HttpResult<AdminFulfillmentSetDetailResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)

  const [fulfillmentSet, serviceZones] = await Promise.all([
    service.retrieveFulfillmentSet(req.params.id),
    service.listServiceZones({ fulfillmentSetId: req.params.id }),
  ])

  return { status: 200, json: { fulfillmentSet: { ...fulfillmentSet, serviceZones } } }
}

type PostInput = { params: IdParams; body: AdminUpdateFulfillmentSetBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminUpdateFulfillmentSetResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [fulfillmentSet] = await service.updateFulfillmentSets([req.params.id], req.body)
  if (!fulfillmentSet) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Fulfillment set with id "${req.params.id}" not found` })
  }
  return { status: 200, json: { fulfillmentSet } }
}

type DeleteInput = { params: IdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>): Promise<HttpResult<DeleteResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.softDeleteFulfillmentSets([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
