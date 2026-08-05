import type { AwilixContainer } from 'awilix'
import { asValue } from 'awilix'
import type { AuthModuleOptions } from '../../../core/types/auth/provider.js'
import type { AbstractAuthModuleProvider } from '../../../core/utils/abstract-auth-module-provider.js'
import { AuthProviderService } from '../services/auth-provider-service.js'

type ProviderConstructor = new (
  container: Record<string, unknown>,
  config: Record<string, unknown>,
) => AbstractAuthModuleProvider

export async function loadAuthProviders({
  container,
  options,
}: {
  container: AwilixContainer
  options?: Record<string, unknown>
}): Promise<void> {
  // options is Record<string, unknown> at the module-framework boundary; narrow here
  const opts = options as AuthModuleOptions | undefined

  if (opts?.providers) {
    for (const config of opts.providers) {
      for (const ServiceClass of config.resolve.services) {
        const Klass = ServiceClass as ProviderConstructor
        const instance = new Klass(container.cradle, config.options ?? {})
        container.register({ [`au_${config.id}`]: asValue(instance) })
      }
    }
  }

  const authProviderService = new AuthProviderService({ container })
  container.register({ authProviderService: asValue(authProviderService) })
}
