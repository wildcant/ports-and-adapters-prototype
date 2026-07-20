import { faker } from '@faker-js/faker'
import type { CreateUser } from '../../src/modules/user/models/user.js'

export function generateUser(overrides?: Partial<CreateUser>): CreateUser {
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
