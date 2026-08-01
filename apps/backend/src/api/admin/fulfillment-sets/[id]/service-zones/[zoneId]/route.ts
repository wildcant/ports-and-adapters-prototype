import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminServiceZoneDetailResponse,
  AdminUpdateServiceZoneBody,
  AdminUpdateServiceZoneResponse,
  AdminZoneIdParams,
  DeleteResponse,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

type GetInput = { params: AdminZoneIdParams }

export const GET = async (req: HttpRequest<GetInput>): Promise<HttpResult<AdminServiceZoneDetailResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)

  const [serviceZone, geoZones] = await Promise.all([
    service.retrieveServiceZone(req.params.zoneId),
    service.listGeoZones({ serviceZoneId: req.params.zoneId }),
  ])

  return { status: 200, json: { serviceZone: { ...serviceZone, geoZones } } }
}

type PostInput = { params: AdminZoneIdParams; body: AdminUpdateServiceZoneBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminUpdateServiceZoneResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [serviceZone] = await service.updateServiceZones([req.params.zoneId], req.body)
  if (!serviceZone) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Service zone with id "${req.params.zoneId}" not found` })
  }
  return { status: 200, json: { serviceZone } }
}

type DeleteInput = { params: AdminZoneIdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>): Promise<HttpResult<DeleteResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.deleteServiceZones([req.params.zoneId])
  return { status: 200, json: { id: req.params.zoneId, deleted: true } }
}
