import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminUpdateServiceZoneBody, AdminZoneIdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

type GetInput = { params: AdminZoneIdParams }

export const GET = async (req: HttpRequest<GetInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)

  const [serviceZone, geoZones] = await Promise.all([
    service.retrieveServiceZone(req.params.zoneId),
    service.listGeoZones({ serviceZoneId: req.params.zoneId }),
  ])

  return { status: 200, json: { serviceZone: { ...serviceZone, geoZones } } } satisfies HttpResult
}

type PostInput = { params: AdminZoneIdParams; body: AdminUpdateServiceZoneBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [serviceZone] = await service.updateServiceZones([req.params.zoneId], req.body)
  return { status: 200, json: { serviceZone } } satisfies HttpResult
}

type DeleteInput = { params: AdminZoneIdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  await service.deleteServiceZones([req.params.zoneId])
  return { status: 200, json: { id: req.params.zoneId, deleted: true } } satisfies HttpResult
}
