/**
 * Shared container -- usable as a library from other workspaces.
 * Creates and wires the Awilix container once, then re-exports it.
 */

import { asValue, createContainer } from 'awilix'
import postgres from 'postgres'
import { bootstrapModule } from './core/bootstrap/index.js'
import { createLogger } from './core/logger/index.js'
import { ContainerRegistrationKeys } from './core/utils/index.js'
import { env } from './env.js'
import customerModule from './modules/customer/index.js'
import userModule from './modules/user/index.js'

const container = createContainer()

// Register logger
container.register({
  [ContainerRegistrationKeys.LOGGER]: asValue(createLogger()),
})

// Register shared pg connection pool
const client = postgres(env.DATABASE_URL, { prepare: false })
container.register({
  [ContainerRegistrationKeys.PG_CONNECTION]: asValue(client),
})

// Modules using two-container bootstrap
bootstrapModule(container, userModule)
bootstrapModule(container, customerModule)

export { container }
