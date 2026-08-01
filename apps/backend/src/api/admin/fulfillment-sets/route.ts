import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateFulfillmentSetBody,
  AdminCreateFulfillmentSetResponse,
  AdminFulfillmentSetListResponse,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult<AdminFulfillmentSetListResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const fulfillmentSets = await service.listFulfillmentSets()
  return { status: 200, json: { fulfillmentSets } }
}

type PostInput = { body: AdminCreateFulfillmentSetBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<AdminCreateFulfillmentSetResponse>> => {
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const [fulfillmentSet] = await service.createFulfillmentSets([req.body])
  if (!fulfillmentSet) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Fulfillment set not returned after create' })
  }
  return { status: 201, json: { fulfillmentSet } }
}
