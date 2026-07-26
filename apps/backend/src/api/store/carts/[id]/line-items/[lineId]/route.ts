import type { LineIdParams, UpdateLineItemBody } from '@core/http-schemas/cart/payloads.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../../../server/ports.js'

type PostInput = { params: LineIdParams; body: UpdateLineItemBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const lineItem = await cartService.updateLineItem(req.params.lineId, req.body)

  return { status: 200, json: { lineItem } } satisfies HttpResult
}

type DeleteInput = { params: LineIdParams }

export const DELETE = async (req: HttpRequest<DeleteInput>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  await cartService.deleteLineItems([req.params.lineId])

  return { status: 200, json: { id: req.params.lineId, deleted: true } } satisfies HttpResult
}
