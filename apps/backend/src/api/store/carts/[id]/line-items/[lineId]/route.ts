import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  DeleteResponse,
  LineIdParams,
  StoreUpdateCartLineItemResponse,
  UpdateLineItemBody,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

type PostInput = { params: LineIdParams; body: UpdateLineItemBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<StoreUpdateCartLineItemResponse>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [lineItem] = await cartService.updateLineItems([req.params.lineId], req.body)
  if (!lineItem) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Line item with id "${req.params.lineId}" not found` })
  }

  return { status: 200, json: { lineItem } }
}

type DeleteInput = { params: LineIdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>): Promise<HttpResult<DeleteResponse>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  await cartService.deleteLineItems([req.params.lineId])

  return { status: 200, json: { id: req.params.lineId, deleted: true } }
}
