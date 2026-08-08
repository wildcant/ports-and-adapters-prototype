import type { ActorType } from '@proteus/http-schemas/auth'

export type HttpConfig = {
  authMethodsPerActor: Partial<Record<ActorType, string[]>>
  authVerificationsPerActor: Partial<Record<ActorType, { entityType: string; authProvider: string }[]>>
}

export type ProjectConfig = {
  http: HttpConfig
}

export type ConfigModule = {
  projectConfig: ProjectConfig
  featureFlags: Record<string, boolean | string | Record<string, boolean>>
}

export type InputConfig = {
  projectConfig?: {
    http?: Partial<HttpConfig>
  }
  featureFlags?: Record<string, boolean | string | Record<string, boolean>>
}
