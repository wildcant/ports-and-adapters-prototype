import type { CreateRefundReasonBody } from '@core/http-schemas/payment/payloads.js'
import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const refundReasons = await paymentService.listRefundReasons()

  return { status: 200, json: { refundReasons } } satisfies HttpResult
}

type Input = { body: CreateRefundReasonBody }

export const POST = async (req: HttpRequest<Input>) => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const [refundReason] = await paymentService.createRefundReasons([req.body])

  return { status: 201, json: { refundReason } } satisfies HttpResult
}
