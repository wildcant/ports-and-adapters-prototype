import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminPaymentCollectionResponse, IdParams } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<AdminPaymentCollectionResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const collection = await paymentService.retrievePaymentCollection(req.params.id)

  const session = await paymentService.createPaymentSession(collection.id, {
    providerId: 'pp_system_default',
    amount: collection.amount,
    currencyCode: collection.currencyCode,
  })

  const payment = await paymentService.authorizePaymentSession(session.id)

  if (payment) {
    await paymentService.capturePayment({ paymentId: payment.id, amount: collection.amount })
  }

  const updated = await paymentService.retrievePaymentCollection(collection.id)

  return { status: 200, json: { paymentCollection: updated } }
}
