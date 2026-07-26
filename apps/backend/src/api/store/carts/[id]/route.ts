import type { UpdateCartBody } from '@core/http-schemas/cart/payloads.js'
import type { IdParams } from '@core/http-schemas/common.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type GetInput = { params: IdParams }

export const GET = async (req: HttpRequest<GetInput>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)

  const [cart, lineItems] = await Promise.all([
    cartService.retrieveCart(req.params.id),
    cartService.listLineItems({ cartId: req.params.id }),
  ])

  return { status: 200, json: { cart: { ...cart, items: lineItems } } } satisfies HttpResult
}

type PostInput = { params: IdParams; body: UpdateCartBody }

export const POST = async (req: HttpRequest<PostInput>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [cart] = await cartService.updateCarts([req.params.id], req.body)

  return { status: 200, json: { cart } } satisfies HttpResult
}
