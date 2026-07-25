import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '@core/types/index.js'
import { faker } from '@faker-js/faker'

export function generateCreateUserDTO(overrides?: Partial<CreateUserDTO>): CreateUserDTO {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    ...overrides,
  }
}

export function generateUpdateUserDTO(overrides?: Partial<UpdateUserDTO>): UpdateUserDTO {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    ...overrides,
  }
}

export function generateUserDTO(overrides?: Partial<UserDTO>): UserDTO {
  return {
    id: `usr_${faker.string.alphanumeric(32)}`,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    ...overrides,
  }
}
