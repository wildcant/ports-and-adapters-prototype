import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminPaymentResponse, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type Input = { params: IdParams }

export const GET = async (req: HttpRequest<Input>): Promise<HttpResult<AdminPaymentResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const payment = await paymentService.retrievePayment(req.params.id)

  return { status: 200, json: { payment } }
}
