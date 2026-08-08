import type { ConfigModule, InputConfig } from './types.js'

const DEFAULT_HTTP_CONFIG: ConfigModule['projectConfig']['http'] = {
  authMethodsPerActor: {
    user: ['emailpass'],
    customer: ['emailpass'],
  },
  authVerificationsPerActor: {},
}

export class ConfigManager {
  #config: ConfigModule | undefined

  get config(): ConfigModule {
    if (!this.#config) {
      throw new Error('[config] Config not loaded. Call loadConfig() first.')
    }
    return this.#config
  }

  loadConfig(input: InputConfig = {}): ConfigModule {
    const httpInput = input.projectConfig?.http
    this.#config = {
      projectConfig: {
        http: {
          authMethodsPerActor: httpInput?.authMethodsPerActor ?? DEFAULT_HTTP_CONFIG.authMethodsPerActor,
          authVerificationsPerActor:
            httpInput?.authVerificationsPerActor ?? DEFAULT_HTTP_CONFIG.authVerificationsPerActor,
        },
      },
      featureFlags: input.featureFlags ?? {},
    }
    return this.#config
  }
}
