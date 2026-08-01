import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCapturePaymentBody, IdParams } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams; body: AdminCapturePaymentBody }

export const POST = async (req: HttpRequest<Input>) => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)

  const payment = await paymentService.capturePayment({
    paymentId: req.params.id,
    amount: req.body.amount,
  })

  return { status: 200, json: { payment } } satisfies HttpResult
}
