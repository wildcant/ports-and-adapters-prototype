import { ModuleProvider } from '../../core/utils/module-provider.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { EmailpassProvider } from './emailpass.js'

export default ModuleProvider(Modules.AUTH, {
  services: [EmailpassProvider],
})
