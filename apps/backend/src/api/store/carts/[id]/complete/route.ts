import type { IdParams, StoreCartResponse } from '@proteus/http-schemas'
import { completeCartWorkflow } from '@workflows/cart/complete-cart.js'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<StoreCartResponse>> => {
  const cart = await completeCartWorkflow.run({ cartId: req.params.id })

  return { status: 200, json: { cart } }
}
