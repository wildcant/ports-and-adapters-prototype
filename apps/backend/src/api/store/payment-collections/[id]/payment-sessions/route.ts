import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { CreatePaymentSessionBody, IdParams, StoreCreatePaymentSessionResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams; body: CreatePaymentSessionBody }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<StoreCreatePaymentSessionResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const collection = await paymentService.retrievePaymentCollection(req.params.id)

  const session = await paymentService.createPaymentSession(collection.id, {
    providerId: req.body.providerId,
    amount: collection.amount,
    currencyCode: collection.currencyCode,
    data: req.body.data,
    context: req.body.context,
  })

  return { status: 201, json: { paymentSession: session } }
}
