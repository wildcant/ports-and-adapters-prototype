export type CreateCustomerDTO = {
  first_name: string
  last_name: string
  email: string
}

export type UpdateCustomerDTO = {
  first_name?: string
  last_name?: string
  email?: string
}
