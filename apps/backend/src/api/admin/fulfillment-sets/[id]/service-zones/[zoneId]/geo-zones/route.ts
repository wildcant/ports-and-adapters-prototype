import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCreateGeoZoneBody, AdminCreateGeoZoneResponse, AdminZoneIdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../../../server/ports.js'

type PostInput = { params: AdminZoneIdParams; body: AdminCreateGeoZoneBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminCreateGeoZoneResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [geoZone] = await service.createGeoZones([{ ...req.body, serviceZoneId: req.params.zoneId }])
  if (!geoZone) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Geo zone not returned after create' })
  return { status: 201, json: { geoZone } }
}
