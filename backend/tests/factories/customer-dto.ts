import type { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@core/types/index.js'
import { faker } from '@faker-js/faker'

/**
 * Generate a `CreateCustomerDTO` — the input shape for `createCustomers()`.
 * Pure function — no side effects.
 */
export function generateCreateCustomerDTO(overrides?: Partial<CreateCustomerDTO>): CreateCustomerDTO {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    ...overrides,
  }
}

/**
 * Generate an `UpdateCustomerDTO` — the input shape for `updateCustomers()`.
 * All fields optional; fakes them all by default.
 */
export function generateUpdateCustomerDTO(overrides?: Partial<UpdateCustomerDTO>): UpdateCustomerDTO {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    ...overrides,
  }
}

/**
 * Generate a `CustomerDTO` — the output shape returned by the service.
 * Useful for mocking repository return values in unit tests.
 */
export function generateCustomerDTO(overrides?: Partial<CustomerDTO>): CustomerDTO {
  return {
    id: `cus_${faker.string.alphanumeric(32)}`,
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    ...overrides,
  }
}
