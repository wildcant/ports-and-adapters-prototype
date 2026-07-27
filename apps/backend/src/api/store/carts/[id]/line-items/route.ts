import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AddLineItemBody, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams; body: AddLineItemBody }

export const POST = async (req: HttpRequest<Input>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [lineItem] = await cartService.addLineItems(req.params.id, [req.body])

  return { status: 201, json: { lineItem } } satisfies HttpResult
}
