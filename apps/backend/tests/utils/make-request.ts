import { defineAppConfig } from '@core/config/index.js'
import { ContainerRegistrationKeys } from '@core/utils/container.js'
import type { HttpRequest } from '../../src/server/ports.js'

export function makeRequest(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return {
    params: {},
    query: {},
    validatedQuery: {},
    body: undefined,
    scope: {
      resolve: (key: string) => {
        if (key === ContainerRegistrationKeys.CONFIG_MODULE) return defineAppConfig()
        throw new Error(`Unexpected resolve: ${key}`)
      },
    } as unknown as HttpRequest['scope'],
    headers: {},
    ...overrides,
  }
}
