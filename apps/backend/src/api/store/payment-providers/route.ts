import type { IPaymentModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { StorePaymentProviderListResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult<StorePaymentProviderListResponse>> => {
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const providers = await paymentService.listPaymentProviders({ isEnabled: true })

  // Exclude system providers from store-facing list
  const storeProviders = providers.filter((p) => !p.id.startsWith('pp_system_'))

  return { status: 200, json: { paymentProviders: storeProviders } }
}
