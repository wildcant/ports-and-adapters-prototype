import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { AdminCreateServiceZone, AdminCreateServiceZoneResponse, IdParams } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

export const PostInput = { params: IdParams, body: AdminCreateServiceZone }
export const PostOutput = AdminCreateServiceZoneResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [serviceZone] = await service.createServiceZones([{ ...req.body, fulfillmentSetId: req.params.id }])
  if (!serviceZone) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Service zone not returned after create' })
  }
  return { status: 201, json: { serviceZone } }
}
