/**
 * PORTS -- Pure interfaces. No framework, no ORM, no infrastructure.
 * These define the contracts that adapters must fulfill.
 */

// ---- Domain types ----

export type User = {
  id: string
  email: string
  name: string
  created_at: string
}

export type CreateUserInput = {
  email: string
  name: string
}

export type UpdateUserInput = {
  email?: string
  name?: string
}

// ---- Driven port: repository (outbound) ----

export type UserRepository = {
  find(): Promise<User[]>
  findById(id: string): Promise<User | null>
  create(data: CreateUserInput): Promise<User>
  update(id: string, data: UpdateUserInput): Promise<User | null>
  delete(id: string): Promise<boolean>
}

// ---- Driving port: service (inbound) ----

export type IdentityService = {
  listUsers(): Promise<User[]>
  getUser(id: string): Promise<User>
  createUser(data: CreateUserInput): Promise<User>
  updateUser(id: string, data: UpdateUserInput): Promise<User>
  deleteUser(id: string): Promise<{ id: string; deleted: boolean }>
}
