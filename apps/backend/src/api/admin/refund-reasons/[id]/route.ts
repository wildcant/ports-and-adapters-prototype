import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { DeleteResponse, IdParams } from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type Input = { params: IdParams }

export const DELETE = async (req: HttpRequest<Input>): Promise<HttpResult<DeleteResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  await paymentService.softDeleteRefundReasons([req.params.id])

  return { status: 200, json: { id: req.params.id, deleted: true } }
}
