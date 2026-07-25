import { type AwilixContainer, asClass, asValue, createContainer } from 'awilix'
import { drizzle } from 'drizzle-orm/postgres-js'
import type { Sql } from 'postgres'
import type { Logger } from '../types/logger.js'
import { ContainerRegistrationKeys } from '../utils/container.js'
import type { ModuleDefinition } from '../utils/module.js'
import { createWithTransaction } from '../utils/with-transaction.js'

export async function bootstrapModule<TOptions = Record<string, unknown>>(
  sharedContainer: AwilixContainer,
  moduleDefinition: ModuleDefinition,
  options?: TOptions,
): Promise<void> {
  const localContainer = createContainer()

  // Bridge shared pg pool and create per-module Drizzle instance
  const pgClient: Sql = sharedContainer.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const logger: Logger = sharedContainer.resolve(ContainerRegistrationKeys.LOGGER)
  const db = drizzle(pgClient, { casing: 'snake_case' })

  localContainer.register({
    db: asValue(db),
    logger: asValue(logger),
    withTransaction: asValue(createWithTransaction(db)),
  })

  // Register repositories in the local container (private to this module)
  for (const [key, RepoClass] of Object.entries(moduleDefinition.repositories)) {
    localContainer.register({
      [key]: asClass(RepoClass).singleton(),
    })
  }

  // Run loaders (e.g. provider registration) before instantiating the service
  if (moduleDefinition.loaders) {
    for (const loader of moduleDefinition.loaders) {
      await loader({ container: localContainer, options: options as Record<string, unknown> })
    }
  }

  // Instantiate the module service with all local deps
  const service = new moduleDefinition.service(localContainer.cradle)

  // Expose only the service in the shared container
  sharedContainer.register({
    [moduleDefinition.key]: asValue(service),
  })
}
