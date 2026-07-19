import type {
  Context,
  CreateCustomerDTO,
  CustomerDTO,
  FilterableCustomerProps,
  FindConfig,
  ICustomerModuleService,
  UpdateCustomerDTO,
} from '../../../core/types/index.js'
import type { WithTransaction } from '../../../core/utils/with-transaction.js'
import type { CustomerRepository } from '../repositories/customer.js'

type InjectedDependencies = {
  customerRepository: CustomerRepository
  withTransaction: WithTransaction
}

export class CustomerModuleService implements ICustomerModuleService {
  private customerRepository: CustomerRepository
  private withTransaction: WithTransaction

  constructor({ customerRepository, withTransaction }: InjectedDependencies) {
    this.customerRepository = customerRepository
    this.withTransaction = withTransaction
  }

  async retrieveCustomer(
    customerId: string,
    config?: FindConfig<CustomerDTO>,
    context?: Context,
  ): Promise<CustomerDTO> {
    return this.customerRepository.findByIdOrFail(customerId, config, context)
  }

  async listCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context?: Context,
  ): Promise<CustomerDTO[]> {
    return this.customerRepository.find(filters, config, context)
  }

  async listAndCountCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context?: Context,
  ): Promise<[CustomerDTO[], number]> {
    const [rows, count] = await this.customerRepository.findAndCount(filters, config, context)
    return [rows, count]
  }

  async createCustomers(data: CreateCustomerDTO[], context?: Context): Promise<CustomerDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.customerRepository.createMany(data, ctx)
    })
  }

  async updateCustomers(customerIds: string[], data: UpdateCustomerDTO, context?: Context): Promise<CustomerDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.customerRepository.update(customerIds, data, ctx)
    })
  }

  async deleteCustomers(customerIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.customerRepository.delete(customerIds, ctx)
    })
  }

  async softDeleteCustomers(customerIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.customerRepository.softDelete(customerIds, ctx)
    })
  }

  async restoreCustomers(customerIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.customerRepository.restore(customerIds, ctx)
    })
  }
}
