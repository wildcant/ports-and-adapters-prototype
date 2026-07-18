import { type AwilixContainer, asClass, asValue, createContainer } from 'awilix'
import { drizzle } from 'drizzle-orm/postgres-js'
import type { Sql } from 'postgres'
import { ContainerRegistrationKeys } from '../utils/container.js'
import type { ModuleDefinition } from '../utils/module.js'
import { createWithTransaction } from '../utils/with-transaction.js'

export function bootstrapModule(sharedContainer: AwilixContainer, moduleDefinition: ModuleDefinition): void {
  const localContainer = createContainer()

  // Bridge shared pg pool and create per-module Drizzle instance
  const pgClient: Sql = sharedContainer.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const db = drizzle(pgClient)

  localContainer.register({
    db: asValue(db),
    withTransaction: asValue(createWithTransaction(db)),
  })

  // Register repositories in the local container (private to this module)
  for (const [key, RepoClass] of Object.entries(moduleDefinition.repositories)) {
    localContainer.register({
      [key]: asClass(RepoClass).singleton(),
    })
  }

  // Instantiate the module service with all local deps
  const service = new moduleDefinition.service(localContainer.cradle)

  // Expose only the service in the shared container
  sharedContainer.register({
    [moduleDefinition.key]: asValue(service),
  })
}
