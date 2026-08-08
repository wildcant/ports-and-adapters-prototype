import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { AdminCreateGeoZone, AdminCreateGeoZoneResponse, AdminZoneIdParams } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../../../server/ports.js'

export const PostInput = { params: AdminZoneIdParams, body: AdminCreateGeoZone }
export const PostOutput = AdminCreateGeoZoneResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [geoZone] = await service.createGeoZones([{ ...req.body, serviceZoneId: req.params.zoneId }])
  if (!geoZone) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Geo zone not returned after create' })
  return { status: 201, json: { geoZone } }
}
