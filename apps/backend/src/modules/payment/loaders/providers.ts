import type { AwilixContainer } from 'awilix'
import { asValue } from 'awilix'
import type { AbstractPaymentProvider } from '../../../core/utils/abstract-payment-provider.js'
import type { ModuleProviderExports } from '../../../core/utils/module-provider.js'
import { SystemPaymentProvider } from '../providers/system.js'
import { PaymentProviderService } from '../services/payment-provider-service.js'

type ProviderConfig = {
  resolve: ModuleProviderExports
  id: string
  options?: Record<string, unknown>
}

type LoaderOptions = {
  providers?: ProviderConfig[]
}

// biome-ignore lint/suspicious/noExplicitAny: provider constructors accept varied dependency shapes
type ProviderConstructor = (new (...args: any[]) => AbstractPaymentProvider) & { identifier: string }

export async function loadProviders({
  container,
  options,
}: {
  container: AwilixContainer
  options?: Record<string, unknown>
}): Promise<void> {
  const opts = options as LoaderOptions | undefined
  const providerKeys: string[] = []

  // 1. Always register the system provider
  const systemKey = 'system_default'
  const systemProvider = new SystemPaymentProvider()
  container.register({ [`pp_${systemKey}`]: asValue(systemProvider) })
  providerKeys.push(systemKey)

  // 2. Register configured providers
  if (opts?.providers) {
    for (const config of opts.providers) {
      const { resolve: providerExports, id, options: providerOptions } = config

      for (const ServiceClass of providerExports.services) {
        const Klass = ServiceClass as ProviderConstructor
        const identifier = Klass.identifier
        if (!identifier) {
          throw new Error(`Provider class ${Klass.name} is missing static "identifier" property.`)
        }

        const key = `${identifier}_${id}`
        const instance = new Klass(container.cradle, providerOptions ?? {})
        container.register({ [`pp_${key}`]: asValue(instance) })
        providerKeys.push(key)
      }
    }
  }

  // 3. Register PaymentProviderService itself (needs the container to resolve providers)
  const providerService = new PaymentProviderService({
    container,
    paymentProviderRepository: container.resolve('paymentProviderRepository'),
    logger: container.resolve('logger'),
  })
  container.register({ paymentProviderService: asValue(providerService) })

  // 4. Upsert all provider keys into the payment_provider table
  await providerService.upsert(providerKeys.map((key) => ({ id: `pp_${key}`, isEnabled: true })))
}
