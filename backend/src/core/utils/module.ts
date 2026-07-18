import type { PgTable } from 'drizzle-orm/pg-core'

// biome-ignore lint/suspicious/noExplicitAny: DI constructors accept varied dependency shapes
type Constructor<T = unknown> = new (...args: any[]) => T

export type ModuleDefinition = {
  key: string
  service: Constructor
  repositories: Record<string, Constructor>
  models: PgTable[]
}

export function Module<const Key extends string, const Service extends Constructor>(
  key: Key,
  config: {
    service: Service
    repositories: Record<string, Constructor>
    models: PgTable[]
  },
): ModuleDefinition {
  return { key, ...config }
}
