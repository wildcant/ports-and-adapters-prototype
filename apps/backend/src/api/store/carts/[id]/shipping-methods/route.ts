import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICartModuleService, IFulfillmentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AddCartShippingMethodBody, IdParams, StoreCreateCartShippingMethodResponse } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type PostInput = { params: IdParams; body: AddCartShippingMethodBody }

export const POST = async (
  req: HttpRequest<PostInput>,
): Promise<HttpResult<StoreCreateCartShippingMethodResponse | { message: string }>> => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const fulfillmentService = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)

  // Retrieve the shipping option for name/amount
  const shippingOption = await fulfillmentService.retrieveShippingOption(req.body.shippingOptionId)

  if (!shippingOption.isEnabled) {
    return {
      status: 400,
      json: { message: `Shipping option "${req.body.shippingOptionId}" is not available` },
    }
  }

  const amount = shippingOption.amount ?? 0

  // Remove existing shipping methods on the cart (replace strategy for MVP)
  const existing = await cartService.listShippingMethods({ cartId: req.params.id })
  if (existing.length > 0) {
    await cartService.deleteShippingMethods(existing.map((sm) => sm.id))
  }

  // Add the new shipping method
  const [shippingMethod] = await cartService.addShippingMethods(req.params.id, [
    {
      name: shippingOption.name,
      amount,
      shippingOptionId: shippingOption.id,
      data: req.body.data ? JSON.stringify(req.body.data) : null,
    },
  ])
  if (!shippingMethod) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Shipping method not returned after create' })
  }

  return { status: 201, json: { shippingMethod } }
}
