import type { BaseFilterable, OperatorMap } from '../common.js'

export type CustomerDTO = {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface FilterableCustomerProps extends BaseFilterable<FilterableCustomerProps> {
  id?: string | string[]
  email?: string | string[] | OperatorMap<string>
  first_name?: string | OperatorMap<string>
  last_name?: string | OperatorMap<string>
  created_at?: OperatorMap<Date>
  updated_at?: OperatorMap<Date>
}
