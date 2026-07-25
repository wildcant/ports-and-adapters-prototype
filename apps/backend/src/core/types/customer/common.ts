import type { BaseFilterable, OperatorMap } from '../common.js'

export type CustomerDTO = {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface FilterableCustomerProps extends BaseFilterable<FilterableCustomerProps> {
  id?: string | string[]
  email?: string | string[] | OperatorMap<string>
  firstName?: string | OperatorMap<string>
  lastName?: string | OperatorMap<string>
  createdAt?: OperatorMap<Date>
  updatedAt?: OperatorMap<Date>
}

export interface FilterableCustomerAddressProps extends BaseFilterable<FilterableCustomerAddressProps> {
  id?: string | string[]
  customerId?: string | string[]
}

export type CustomerAddressDTO = {
  id: string
  customerId: string
  addressName: string | null
  isDefaultShipping: boolean
  isDefaultBilling: boolean
  company: string | null
  firstName: string | null
  lastName: string | null
  address1: string | null
  address2: string | null
  city: string | null
  countryCode: string | null
  province: string | null
  postalCode: string | null
  phone: string | null
  metadata: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
