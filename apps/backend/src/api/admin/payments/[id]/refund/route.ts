import type { IdParams } from '@core/http-schemas/common.js'
import type { RefundPaymentBody } from '@core/http-schemas/payment/payloads.js'
import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type Input = { params: IdParams; body: RefundPaymentBody }

export const POST = async (req: HttpRequest<Input>) => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)

  const payment = await paymentService.refundPayment({
    paymentId: req.params.id,
    amount: req.body.amount,
    refundReasonId: req.body.refundReasonId,
    note: req.body.note,
  })

  return { status: 200, json: { payment } } satisfies HttpResult
}
