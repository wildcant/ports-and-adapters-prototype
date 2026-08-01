import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { CreateCartBody, StoreCreateCartResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type Input = { body: CreateCartBody }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<StoreCreateCartResponse>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [cart] = await cartService.createCarts([req.body])
  if (!cart) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Cart not returned after create' })

  return { status: 201, json: { cart } }
}
