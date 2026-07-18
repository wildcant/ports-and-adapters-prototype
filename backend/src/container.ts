/**
 * Shared container -- usable as a library from other workspaces.
 * Creates and wires the Awilix container once, then re-exports it.
 */

import { asValue, createContainer } from 'awilix'
import postgres from 'postgres'
import { bootstrapModule } from './core/bootstrap/index.js'
import { ContainerRegistrationKeys } from './core/utils/index.js'
import { env } from './env.js'
import customerModule from './modules/customer/index.js'
import { registerIdentityModule } from './modules/identity/index.js'

const container = createContainer()

// Register shared pg connection pool
const client = postgres(env.SUPABASE_DATABASE_URL, { prepare: false })
container.register({
  [ContainerRegistrationKeys.PG_CONNECTION]: asValue(client),
})

// Legacy module (uses old pattern — will be migrated in ticket 02)
registerIdentityModule(container)

// New modules using two-container bootstrap
bootstrapModule(container, customerModule)

export type {
  CreateUserInput,
  IdentityService,
  User,
} from './modules/identity/ports.js'
export { container }
