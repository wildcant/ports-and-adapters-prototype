import type { IdParams } from '@core/http-schemas/common.js'
import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type Input = { params: IdParams }

export const GET = async (req: HttpRequest<Input>) => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const collection = await paymentService.retrievePaymentCollection(req.params.id)

  return { status: 200, json: { paymentCollection: collection } } satisfies HttpResult
}
