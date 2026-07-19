import { faker } from '@faker-js/faker'
import type { CreateCustomer } from '../../src/modules/customer/models/customer.js'

/**
 * Generate a full DB insert shape for the `customer` table.
 * Pure function — no side effects.
 */
export function generateCustomer(overrides?: Partial<CreateCustomer>): CreateCustomer {
  return {
    id: `cus_${faker.string.alphanumeric(32)}`,
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    ...overrides,
  }
}
