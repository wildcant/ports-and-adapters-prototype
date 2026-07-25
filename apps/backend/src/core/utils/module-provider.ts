// biome-ignore lint/suspicious/noExplicitAny: DI constructors accept varied dependency shapes
type Constructor<T = unknown> = new (...args: any[]) => T

export type ModuleProviderExports = {
  module?: string
  services: Constructor[]
}

export function ModuleProvider(moduleName: string, { services }: { services: Constructor[] }): ModuleProviderExports {
  return { module: moduleName, services }
}
