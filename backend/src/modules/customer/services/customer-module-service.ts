import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type {
  CreateCustomerDTO,
  CustomerDTO,
  FilterableCustomerProps,
  FindConfig,
  ICustomerModuleService,
  SharedContext,
  UpdateCustomerDTO,
} from '../../../core/types/index.js'
import { withTransaction } from '../../../core/utils/with-transaction.js'
import type { CustomerRepository } from '../repositories/customer.js'

type InjectedDependencies = {
  customerRepository: CustomerRepository
  db: PostgresJsDatabase
}

export class CustomerModuleService implements ICustomerModuleService {
  private customerRepository: CustomerRepository
  private db: PostgresJsDatabase

  constructor({ customerRepository, db }: InjectedDependencies) {
    this.customerRepository = customerRepository
    this.db = db
  }

  async retrieveCustomer(
    customerId: string,
    config?: FindConfig<CustomerDTO>,
    context: SharedContext = {},
  ): Promise<CustomerDTO> {
    const customer = await this.customerRepository.findById(customerId, config, context)
    if (!customer) {
      throw new Error(`Customer with id "${customerId}" not found`)
    }
    return customer as CustomerDTO
  }

  async listCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context: SharedContext = {},
  ): Promise<CustomerDTO[]> {
    return this.customerRepository.find(filters, config, context) as Promise<CustomerDTO[]>
  }

  async listAndCountCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context: SharedContext = {},
  ): Promise<[CustomerDTO[], number]> {
    const [rows, count] = await this.customerRepository.findAndCount(filters, config, context)
    return [rows as CustomerDTO[], count]
  }

  async createCustomers(data: CreateCustomerDTO, context: SharedContext = {}): Promise<CustomerDTO> {
    return withTransaction(this.db, context, async (ctx) => {
      return this.customerRepository.create(data, ctx) as Promise<CustomerDTO>
    })
  }

  async updateCustomers(
    customerId: string,
    data: UpdateCustomerDTO,
    context: SharedContext = {},
  ): Promise<CustomerDTO> {
    return withTransaction(this.db, context, async (ctx) => {
      return this.customerRepository.update(customerId, data, ctx) as Promise<CustomerDTO>
    })
  }

  async deleteCustomers(customerId: string, context: SharedContext = {}): Promise<void> {
    return withTransaction(this.db, context, async (ctx) => {
      return this.customerRepository.delete(customerId, ctx)
    })
  }

  async softDeleteCustomers(customerIds: string[], context: SharedContext = {}): Promise<void> {
    return withTransaction(this.db, context, async (ctx) => {
      for (const id of customerIds) {
        await this.customerRepository.softDelete(id, ctx)
      }
    })
  }

  async restoreCustomers(customerIds: string[], context: SharedContext = {}): Promise<void> {
    return withTransaction(this.db, context, async (ctx) => {
      for (const id of customerIds) {
        await this.customerRepository.restore(id, ctx)
      }
    })
  }
}
