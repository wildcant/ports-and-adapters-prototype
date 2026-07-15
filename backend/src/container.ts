/**
 * Shared container -- usable as a library from other workspaces.
 * Creates and wires the Awilix container once, then re-exports it.
 */

import { createContainer } from "awilix"
import { registerIdentityModule } from "./modules/identity/index.js"

const container = createContainer()
registerIdentityModule(container)

export { container }
export type { IdentityService, User, CreateUserInput } from "./modules/identity/ports.js"
