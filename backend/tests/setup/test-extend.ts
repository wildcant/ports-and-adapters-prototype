import { test as testBase } from 'vitest'
import { generateCustomer } from '../factories/customer.js'
import { generateCreateCustomerDTO, generateCustomerDTO, generateUpdateCustomerDTO } from '../factories/customer-dto.js'

interface Fixtures {
  db: {
    generate: {
      customer: typeof generateCustomer
    }
  }
  dto: {
    generate: {
      createCustomer: typeof generateCreateCustomerDTO
      updateCustomer: typeof generateUpdateCustomerDTO
      customer: typeof generateCustomerDTO
    }
  }
}

export const test = testBase.extend<Fixtures>({
  async db({ task: _ }, use) {
    await use({
      generate: {
        customer: generateCustomer,
      },
    })
  },
  async dto({ task: _ }, use) {
    await use({
      generate: {
        createCustomer: generateCreateCustomerDTO,
        updateCustomer: generateUpdateCustomerDTO,
        customer: generateCustomerDTO,
      },
    })
  },
})
