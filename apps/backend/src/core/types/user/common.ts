import type { BaseFilterable, OperatorMap } from '../common.js'

export type UserDTO = {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface FilterableUserProps extends BaseFilterable<FilterableUserProps> {
  id?: string | string[] | undefined
  email?: string | string[] | OperatorMap<string> | undefined
  name?: string | OperatorMap<string> | undefined
  createdAt?: OperatorMap<string> | undefined
  updatedAt?: OperatorMap<string> | undefined
}
