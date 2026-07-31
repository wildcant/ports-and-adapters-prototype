/**
 * Shared container bootstrap — registers modules, links, and workflows.
 * Platform-specific deps (logger, dbProvider) are injected by the caller,
 * so each entry point only bundles its own provider (tree-shaking friendly).
 */

import { asValue, createContainer } from 'awilix'
import { bootstrapModule } from './core/bootstrap/index.js'
import type { DbProvider } from './core/db/ports.js'
import type { Logger } from './core/types/logger.js'
import { ContainerRegistrationKeys } from './core/utils/index.js'
import { createSimpleWorkflowEngine } from './core/workflows/simple-adapter.js'
import { setWorkflowEngine } from './core/workflows/types.js'
import { registerLinkService } from './link-modules/index.js'
import cartModule from './modules/cart/index.js'
import customerModule from './modules/customer/index.js'
import fulfillmentModule, { fulfillmentProviderDeclarations } from './modules/fulfillment/index.js'
import inventoryModule from './modules/inventory/index.js'
import paymentModule, { paymentProviderDeclarations } from './modules/payment/index.js'
import productModule from './modules/product/index.js'
import userModule from './modules/user/index.js'

export async function bootstrapContainer(deps: { logger: Logger; dbProvider: DbProvider }) {
  const container = createContainer()
  const { logger, dbProvider } = deps

  container.register({
    [ContainerRegistrationKeys.LOGGER]: asValue(logger),
    [ContainerRegistrationKeys.DB_PROVIDER]: asValue(dbProvider),
    [ContainerRegistrationKeys.GET_DB]: asValue(dbProvider.getDb),
  })

  await bootstrapModule(container, cartModule)
  await bootstrapModule(container, customerModule)
  await bootstrapModule(container, fulfillmentModule, fulfillmentProviderDeclarations)
  await bootstrapModule(container, inventoryModule)
  await bootstrapModule(container, productModule)
  await bootstrapModule(container, paymentModule, paymentProviderDeclarations)
  await bootstrapModule(container, userModule)

  registerLinkService(container)
  setWorkflowEngine(createSimpleWorkflowEngine(), container)

  return container
}
