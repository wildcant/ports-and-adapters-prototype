import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import {
  DeleteResponse,
  LineIdParams,
  StoreUpdateCartLineItemResponse,
  UpdateLineItem,
} from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

export const PostInput = { params: LineIdParams, body: UpdateLineItem }
export const PostOutput = StoreUpdateCartLineItemResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [lineItem] = await cartService.updateLineItems([req.params.lineId], req.body)
  if (!lineItem) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Line item with id "${req.params.lineId}" not found` })
  }

  return { status: 200, json: { lineItem } }
}

export const DeleteInput = { params: LineIdParams }
export const DeleteOutput = DeleteResponse

export const DELETE = async (req: HttpRequest<typeof DeleteInput>): Promise<HttpResult<typeof DeleteOutput>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  await cartService.deleteLineItems([req.params.lineId])

  return { status: 200, json: { id: req.params.lineId, deleted: true } }
}
