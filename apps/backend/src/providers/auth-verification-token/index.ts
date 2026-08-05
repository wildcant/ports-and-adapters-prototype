import { ModuleProvider } from '../../core/utils/module-provider.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { TokenVerificationProvider } from './token-verification.js'

export default ModuleProvider(Modules.AUTH, {
  services: [TokenVerificationProvider],
})
