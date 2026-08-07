import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { CreateCart, StoreCreateCartResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const PostInput = { body: CreateCart }
export const PostOutput = StoreCreateCartResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [cart] = await cartService.createCarts([req.body])
  if (!cart) throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Cart not returned after create' })

  return { status: 201, json: { cart } }
}
