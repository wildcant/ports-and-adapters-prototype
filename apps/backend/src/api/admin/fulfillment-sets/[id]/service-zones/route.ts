import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCreateServiceZoneBody, AdminCreateServiceZoneResponse, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type PostInput = { params: IdParams; body: AdminCreateServiceZoneBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminCreateServiceZoneResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [serviceZone] = await service.createServiceZones([{ ...req.body, fulfillmentSetId: req.params.id }])
  if (!serviceZone) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Service zone not returned after create' })
  }
  return { status: 201, json: { serviceZone } }
}
