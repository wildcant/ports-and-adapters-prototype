import type { CreateCustomerAddressDTO, CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@core/types/index.js'
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
 * Generate a `CreateCustomerAddressDTO` (without `customer_id`) — the nested address input for `createCustomers()`.
 */
export function generateCreateCustomerAddressDTO(
  overrides?: Partial<Omit<CreateCustomerAddressDTO, 'customer_id'>>,
): Omit<CreateCustomerAddressDTO, 'customer_id'> {
  return {
    address_name: faker.location.secondaryAddress(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    address_1: faker.location.streetAddress(),
    city: faker.location.city(),
    country_code: faker.location.countryCode('alpha-2'),
    postal_code: faker.location.zipCode(),
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
