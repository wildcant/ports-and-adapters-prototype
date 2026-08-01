import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCreateRefundReasonBody,
  AdminCreateRefundReasonResponse,
  AdminRefundReasonListResponse,
} from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult<AdminRefundReasonListResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const refundReasons = await paymentService.listRefundReasons()

  return { status: 200, json: { refundReasons } }
}

type Input = { body: AdminCreateRefundReasonBody }

export const POST = async (req: HttpRequest<Input>): Promise<HttpResult<AdminCreateRefundReasonResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const [refundReason] = await paymentService.createRefundReasons([req.body])

  if (!refundReason) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Failed to create refund reason' })
  }

  return { status: 201, json: { refundReason } }
}
