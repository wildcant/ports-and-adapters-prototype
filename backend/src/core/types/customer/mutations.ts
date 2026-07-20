export type CreateCustomerDTO = {
  firstName: string
  lastName: string
  email: string
  addresses?: Omit<CreateCustomerAddressDTO, 'customerId'>[]
}

export type UpdateCustomerDTO = {
  firstName?: string
  lastName?: string
  email?: string
}

export type CreateCustomerAddressDTO = {
  customerId: string
  addressName?: string | null
  isDefaultShipping?: boolean
  isDefaultBilling?: boolean
  company?: string | null
  firstName?: string | null
  lastName?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  countryCode?: string | null
  province?: string | null
  postalCode?: string | null
  phone?: string | null
  metadata?: string | null
}

export type UpdateCustomerAddressDTO = {
  addressName?: string | null
  isDefaultShipping?: boolean
  isDefaultBilling?: boolean
  company?: string | null
  firstName?: string | null
  lastName?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  countryCode?: string | null
  province?: string | null
  postalCode?: string | null
  phone?: string | null
  metadata?: string | null
}
