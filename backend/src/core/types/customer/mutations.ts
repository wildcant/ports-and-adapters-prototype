export type CreateCustomerDTO = {
  first_name: string
  last_name: string
  email: string
  addresses?: Omit<CreateCustomerAddressDTO, 'customer_id'>[]
}

export type UpdateCustomerDTO = {
  first_name?: string
  last_name?: string
  email?: string
}

export type CreateCustomerAddressDTO = {
  customer_id: string
  address_name?: string | null
  is_default_shipping?: boolean
  is_default_billing?: boolean
  company?: string | null
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  country_code?: string | null
  province?: string | null
  postal_code?: string | null
  phone?: string | null
  metadata?: string | null
}

export type UpdateCustomerAddressDTO = {
  address_name?: string | null
  is_default_shipping?: boolean
  is_default_billing?: boolean
  company?: string | null
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  country_code?: string | null
  province?: string | null
  postal_code?: string | null
  phone?: string | null
  metadata?: string | null
}
