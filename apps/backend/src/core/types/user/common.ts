import type { BaseFilterable, OperatorMap } from '../common.js'

export type UserDTO = {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface FilterableUserProps extends BaseFilterable<FilterableUserProps> {
  id?: string | string[]
  email?: string | string[] | OperatorMap<string>
  name?: string | OperatorMap<string>
  createdAt?: OperatorMap<Date>
  updatedAt?: OperatorMap<Date>
}
