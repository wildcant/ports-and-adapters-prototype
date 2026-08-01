import type { CreatePaymentCollectionBody, StoreCreatePaymentCollectionResponse } from '@proteus/http-schemas'
import { createPaymentCollectionForCartWorkflow } from '@workflows/payment/create-payment-collection-for-cart.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type Input = { body: CreatePaymentCollectionBody }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<StoreCreatePaymentCollectionResponse>> => {
  const paymentCollection = await createPaymentCollectionForCartWorkflow.run({ cartId: req.body.cartId })

  return { status: 201, json: { paymentCollection } }
}
