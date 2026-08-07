import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { applyMiddleware } from '@framework/http/apply-middleware.js'
import { applyNamespaceAuth } from '@framework/http/namespace-auth.js'
import type { RouteDefinition } from '@framework/http/types.js'
import { registerOpenApiRoute } from './core/openapi/register-route.js'
import type { Logger } from './core/types/logger.js'
import type { App } from './server/ports.js'
import { RoutesSorter } from './server/routes-sorter.js'

// ---- Definition imports ----

import adminCustomerDefinitions from './api/admin/customers/definitions.js'
import adminFulfillmentProviderDefinitions from './api/admin/fulfillment-providers/definitions.js'
import adminFulfillmentSetDefinitions from './api/admin/fulfillment-sets/definitions.js'
import adminPaymentCollectionDefinitions from './api/admin/payment-collections/definitions.js'
import adminPaymentDefinitions from './api/admin/payments/definitions.js'
import adminProductDefinitions from './api/admin/products/definitions.js'
import adminRefundReasonDefinitions from './api/admin/refund-reasons/definitions.js'
import adminShippingOptionDefinitions from './api/admin/shipping-options/definitions.js'
import adminShippingProfileDefinitions from './api/admin/shipping-profiles/definitions.js'
import adminUserDefinitions from './api/admin/users/definitions.js'
import authDefinitions from './api/auth/definitions.js'
import hookDefinitions from './api/hooks/definitions.js'
import storeAuthDefinitions from './api/store/auth/definitions.js'
import storeCartDefinitions from './api/store/carts/definitions.js'
import storeCustomerDefinitions from './api/store/customers/definitions.js'
import storePaymentCollectionDefinitions from './api/store/payment-collections/definitions.js'
import storePaymentProviderDefinitions from './api/store/payment-providers/definitions.js'
import storeProductDefinitions from './api/store/products/definitions.js'

// ---- All definitions ----

export const allDefinitions: RouteDefinition[] = [
  ...authDefinitions,
  ...adminCustomerDefinitions,
  ...adminFulfillmentProviderDefinitions,
  ...adminFulfillmentSetDefinitions,
  ...adminPaymentCollectionDefinitions,
  ...adminPaymentDefinitions,
  ...adminProductDefinitions,
  ...adminRefundReasonDefinitions,
  ...adminShippingOptionDefinitions,
  ...adminShippingProfileDefinitions,
  ...adminUserDefinitions,
  ...hookDefinitions,
  ...storeAuthDefinitions,
  ...storeCartDefinitions,
  ...storeCustomerDefinitions,
  ...storePaymentCollectionDefinitions,
  ...storePaymentProviderDefinitions,
  ...storeProductDefinitions,
]

// ---- Registration ----

export type RegistryResolver = (routePath: string) => OpenAPIRegistry | undefined

export function registerRoutes(app: App, logger: Logger, resolveRegistry?: RegistryResolver) {
  for (const definition of allDefinitions) {
    applyNamespaceAuth(definition)
  }

  if (resolveRegistry) {
    for (const definition of allDefinitions) {
      const registry = resolveRegistry(definition.matcher)
      if (registry) registerOpenApiRoute(registry, definition.matcher, definition)
    }
  }

  const sorted = new RoutesSorter(allDefinitions).sort()
  for (const definition of sorted) {
    const handler = applyMiddleware(definition)
    app.addRoute(definition.method, definition.matcher, handler)
    logger.info(`  ${definition.method} ${definition.matcher}`)
  }
}
