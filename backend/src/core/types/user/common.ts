import type { BaseFilterable, OperatorMap } from '../common.js'

export type UserDTO = {
  id: string
  email: string
  name: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface FilterableUserProps extends BaseFilterable<FilterableUserProps> {
  id?: string | string[]
  email?: string | string[] | OperatorMap<string>
  name?: string | OperatorMap<string>
  created_at?: OperatorMap<Date>
  updated_at?: OperatorMap<Date>
}
