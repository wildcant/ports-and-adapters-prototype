import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { test as testBase } from 'vitest'
import type { Logger } from '../../src/core/types/logger.js'
import { generateCustomer } from '../factories/customer.js'
import {
  generateCreateCustomerAddressDTO,
  generateCreateCustomerDTO,
  generateCustomerDTO,
  generateUpdateCustomerDTO,
} from '../factories/customer-dto.js'
import { generateUser } from '../factories/user.js'
import { generateCreateUserDTO, generateUpdateUserDTO, generateUserDTO } from '../factories/user-dto.js'
import { db as dbInstance } from './db-setup.js'

const noopLogger: Logger = {
  error() {},
  warn() {},
  info() {},
  http() {},
  debug() {},
  setLogLevel() {},
  shouldLog: () => true,
}

interface Fixtures {
  db: PostgresJsDatabase
  factories: {
    customer: typeof generateCustomer
    user: typeof generateUser
  }
  dto: {
    generate: {
      createCustomer: typeof generateCreateCustomerDTO
      createCustomerAddress: typeof generateCreateCustomerAddressDTO
      updateCustomer: typeof generateUpdateCustomerDTO
      customer: typeof generateCustomerDTO
      createUser: typeof generateCreateUserDTO
      updateUser: typeof generateUpdateUserDTO
      user: typeof generateUserDTO
    }
  }
  logger: Logger
}

export const test = testBase.extend<Fixtures>({
  async db({ task: _ }, use) {
    await use(dbInstance)
  },
  async factories({ task: _ }, use) {
    await use({
      customer: generateCustomer,
      user: generateUser,
    })
  },
  async dto({ task: _ }, use) {
    await use({
      generate: {
        createCustomer: generateCreateCustomerDTO,
        createCustomerAddress: generateCreateCustomerAddressDTO,
        updateCustomer: generateUpdateCustomerDTO,
        customer: generateCustomerDTO,
        createUser: generateCreateUserDTO,
        updateUser: generateUpdateUserDTO,
        user: generateUserDTO,
      },
    })
  },
  async logger({ task: _ }, use) {
    await use(noopLogger)
  },
})
