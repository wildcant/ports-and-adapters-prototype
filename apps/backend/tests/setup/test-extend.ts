import { test as testBase } from 'vitest'
import { noopLogger } from '../../src/core/logger/index.js'
import type { Logger } from '../../src/core/types/logger.js'
import type { Database } from '../../src/schema.type.js'
import { generateCustomer } from '../factories/customer.js'
import {
  generateCreateCustomerAddressDTO,
  generateCreateCustomerDTO,
  generateCustomerDTO,
  generateUpdateCustomerDTO,
} from '../factories/customer-dto.js'
import {
  generateCreateAccountHolderDTO,
  generateCreatePaymentCollectionDTO,
  generateCreatePaymentSessionDTO,
  generateCreateRefundReasonDTO,
  generateUpdatePaymentCollectionDTO,
  generateUpdateRefundReasonDTO,
} from '../factories/payment-dto.js'
import { generateUser } from '../factories/user.js'
import { generateCreateUserDTO, generateUpdateUserDTO, generateUserDTO } from '../factories/user-dto.js'
import { db as dbInstance } from './db-setup.js'

interface Fixtures {
  db: Database
  getDb: () => Database
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
      createPaymentCollection: typeof generateCreatePaymentCollectionDTO
      updatePaymentCollection: typeof generateUpdatePaymentCollectionDTO
      createPaymentSession: typeof generateCreatePaymentSessionDTO
      createRefundReason: typeof generateCreateRefundReasonDTO
      updateRefundReason: typeof generateUpdateRefundReasonDTO
      createAccountHolder: typeof generateCreateAccountHolderDTO
    }
  }
  logger: Logger
}

export const test = testBase.extend<Fixtures>({
  async db({ task: _ }, use) {
    await use(dbInstance)
  },
  async getDb({ task: _ }, use) {
    await use(() => dbInstance)
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
        createPaymentCollection: generateCreatePaymentCollectionDTO,
        updatePaymentCollection: generateUpdatePaymentCollectionDTO,
        createPaymentSession: generateCreatePaymentSessionDTO,
        createRefundReason: generateCreateRefundReasonDTO,
        updateRefundReason: generateUpdateRefundReasonDTO,
        createAccountHolder: generateCreateAccountHolderDTO,
      },
    })
  },
  async logger({ task: _ }, use) {
    await use(noopLogger)
  },
})
