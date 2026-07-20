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

export interface FilterableCustomerAddressProps extends BaseFilterable<FilterableCustomerAddressProps> {
  id?: string | string[]
  customer_id?: string | string[]
}

export type CustomerAddressDTO = {
  id: string
  customer_id: string
  address_name: string | null
  is_default_shipping: boolean
  is_default_billing: boolean
  company: string | null
  first_name: string | null
  last_name: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  country_code: string | null
  province: string | null
  postal_code: string | null
  phone: string | null
  metadata: string | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}
