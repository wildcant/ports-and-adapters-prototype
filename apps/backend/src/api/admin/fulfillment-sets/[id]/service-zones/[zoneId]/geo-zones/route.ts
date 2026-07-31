import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { CreateGeoZoneBody, ZoneIdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../../../server/ports.js'

type PostInput = { params: ZoneIdParams; body: CreateGeoZoneBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [geoZone] = await service.createGeoZones([{ ...req.body, serviceZoneId: req.params.zoneId }])
  return { status: 201, json: { geoZone } } satisfies HttpResult
}
