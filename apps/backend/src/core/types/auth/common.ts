import type { BaseFilterable, OperatorMap } from '../common.js'

export type AuthIdentityDTO = {
  id: string
  appMetadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface FilterableAuthIdentityProps extends BaseFilterable<FilterableAuthIdentityProps> {
  id?: string | string[] | undefined
  createdAt?: OperatorMap<Date> | undefined
  updatedAt?: OperatorMap<Date> | undefined
}

export type ProviderIdentityDTO = {
  id: string
  authIdentityId: string
  entityId: string
  provider: string
  providerMetadata: Record<string, unknown> | null
  userMetadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface FilterableProviderIdentityProps extends BaseFilterable<FilterableProviderIdentityProps> {
  id?: string | string[] | undefined
  authIdentityId?: string | string[] | undefined
  entityId?: string | string[] | OperatorMap<string> | undefined
  provider?: string | string[] | OperatorMap<string> | undefined
  createdAt?: OperatorMap<Date> | undefined
  updatedAt?: OperatorMap<Date> | undefined
}
