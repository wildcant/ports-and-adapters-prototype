import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCreateServiceZoneBody, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type PostInput = { params: IdParams; body: AdminCreateServiceZoneBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [serviceZone] = await service.createServiceZones([{ ...req.body, fulfillmentSetId: req.params.id }])
  return { status: 201, json: { serviceZone } } satisfies HttpResult
}
