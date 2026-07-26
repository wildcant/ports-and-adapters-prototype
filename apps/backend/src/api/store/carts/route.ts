import type { CreateCartBody } from '@core/http-schemas/cart/payloads.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type Input = { body: CreateCartBody }

export const POST = async (req: HttpRequest<Input>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [cart] = await cartService.createCarts([req.body])

  return { status: 201, json: { cart } } satisfies HttpResult
}
