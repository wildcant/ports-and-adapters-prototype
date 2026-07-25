import { ModuleProvider } from '../../core/utils/module-provider.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { StripeProviderService } from './stripe-provider.js'

export default ModuleProvider(Modules.PAYMENT, {
  services: [StripeProviderService],
})
