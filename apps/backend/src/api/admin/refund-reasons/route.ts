import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import {
  AdminCreateRefundReason,
  AdminCreateRefundReasonResponse,
  AdminRefundReasonListResponse,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GetOutput = AdminRefundReasonListResponse

export const GET = async (req: HttpRequest): Promise<HttpResult<typeof GetOutput>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const refundReasons = await paymentService.listRefundReasons()

  return { status: 200, json: { refundReasons } }
}

export const PostInput = { body: AdminCreateRefundReason }
export const PostOutput = AdminCreateRefundReasonResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const [refundReason] = await paymentService.createRefundReasons([req.body])

  if (!refundReason) {
    throw new AppError({ type: ErrorTypes.UNEXPECTED_STATE, message: 'Failed to create refund reason' })
  }

  return { status: 201, json: { refundReason } }
}
