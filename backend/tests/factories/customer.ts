import { faker } from '@faker-js/faker'
import type { CreateCustomer } from '../../src/modules/customer/models/customer.js'

/**
 * Generate a full DB insert shape for the `customer` table.
 * Pure function — no side effects.
 */
export function generateCustomer(overrides?: Partial<CreateCustomer>): CreateCustomer {
  return {
    id: `cus_${faker.string.alphanumeric(32)}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    ...overrides,
  }
}
