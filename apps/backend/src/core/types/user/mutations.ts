export type CreateUserDTO = {
  email: string
  name: string
}

export type UpdateUserDTO = {
  email?: string | undefined
  name?: string | undefined
}
