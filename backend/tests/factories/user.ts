import { faker } from '@faker-js/faker'
import type { CreateUser } from '../../src/modules/user/models/user.js'

export function generateUser(overrides?: Partial<CreateUser>): CreateUser {
  return {
    id: `usr_${faker.string.alphanumeric(32)}`,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    ...overrides,
  }
}
