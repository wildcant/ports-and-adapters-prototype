import { IdParams, StoreCartResponse } from '@proteus/http-schemas/store'
import { completeCartWorkflow } from '@workflows/cart/complete-cart.js'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

export const PostInput = { params: IdParams }
export const PostOutput = StoreCartResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const cart = await completeCartWorkflow.run({ cartId: req.params.id })

  return { status: 200, json: { cart } }
}
