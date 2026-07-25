import type { AwilixContainer } from 'awilix'

// biome-ignore lint/suspicious/noExplicitAny: DI constructors accept varied dependency shapes
type Constructor<T = unknown> = new (...args: any[]) => T

export type LoaderFunction<TOptions = Record<string, unknown>> = (input: {
  container: AwilixContainer
  options?: TOptions
}) => void | Promise<void>

export type ModuleDefinition = {
  key: string
  service: Constructor
  repositories: Record<string, Constructor>
  loaders?: LoaderFunction[]
}

export function Module<const Key extends string, const Service extends Constructor>(
  key: Key,
  config: {
    service: Service
    repositories: Record<string, Constructor>
    loaders?: LoaderFunction[]
  },
): ModuleDefinition {
  return { key, ...config }
}
