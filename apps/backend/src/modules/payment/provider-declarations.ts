import { env } from '../../env.js'
import stripeProvider from '../../providers/payment-stripe/index.js'
import type { ProviderConfig } from './loaders/providers.js'

/**
 * Single source of truth for which payment providers are configured.
 * Used by container.ts (DI registration) and the seed script (DB upsert).
 */
export const paymentProviderDeclarations: ProviderConfig[] = [
  {
    resolve: stripeProvider,
    id: 'default',
    options: {
      apiKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
  },
]
