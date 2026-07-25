import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const providers = await paymentService.listPaymentProviders()

  return { status: 200, json: { paymentProviders: providers } } satisfies HttpResult
}
