import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  IdParams,
  StoreCartDetailResponse,
  StoreUpdateCartResponse,
  UpdateCartBody,
} from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type GetInput = { params: IdParams }

export const GET = async (req: HttpRequest<GetInput>): Promise<HttpResult<StoreCartDetailResponse>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)

  const [cart, lineItems, shippingMethods] = await Promise.all([
    cartService.retrieveCart(req.params.id),
    cartService.listLineItems({ cartId: req.params.id }),
    cartService.listShippingMethods({ cartId: req.params.id }),
  ])

  return { status: 200, json: { cart: { ...cart, items: lineItems, shippingMethods } } }
}

type PostInput = { params: IdParams; body: UpdateCartBody }

export const POST = async (req: HttpRequest<PostInput>): Promise<HttpResult<StoreUpdateCartResponse>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const [cart] = await cartService.updateCarts([req.params.id], req.body)
  if (!cart) throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Cart with id "${req.params.id}" not found` })

  return { status: 200, json: { cart } }
}
