/**
 * MODULE WIRING -- Registers all identity components into the Awilix container.
 *
 * This is the composition root for the identity module. It decides WHICH
 * adapters fulfill WHICH ports. Swap adapters here without touching
 * the service or the routes.
 *
 * To swap ORMs, change the import path:
 *   "./adapters/drizzle/index.js"  ->  Drizzle + SQLite (in-memory)
 *   "./adapters/prisma/index.js"   ->  Prisma + SQLite (file)
 */

import { asFunction, type AwilixContainer } from "awilix"
import { createDb, createUserRepository } from "./adapters/drizzle/index.js"
import { createIdentityService } from "./service.js"

export function registerIdentityModule(container: AwilixContainer) {
  container.register({
    db: asFunction(createDb).singleton(),
    userRepository: asFunction(createUserRepository).singleton(),
    identityService: asFunction(createIdentityService).singleton(),
  })
}
