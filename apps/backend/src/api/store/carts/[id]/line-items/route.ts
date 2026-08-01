import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AddLineItemBody, IdParams, StoreCreateCartLineItemResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams; body: AddLineItemBody }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<StoreCreateCartLineItemResponse>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [lineItem] = await cartService.addLineItems(req.params.id, [req.body])
  if (!lineItem) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Line item not returned after create' })
  }

  return { status: 201, json: { lineItem } }
}
