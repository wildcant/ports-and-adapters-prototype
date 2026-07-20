import type {
  Context,
  CreateCustomerAddressDTO,
  CreateCustomerDTO,
  CustomerAddressDTO,
  CustomerDTO,
  FilterableCustomerAddressProps,
  FilterableCustomerProps,
  FindConfig,
  ICustomerModuleService,
  UpdateCustomerAddressDTO,
  UpdateCustomerDTO,
} from '../../../core/types/index.js'
import type { WithTransaction } from '../../../core/utils/with-transaction.js'
import type { CustomerRepository } from '../repositories/customer.js'
import type { CustomerAddressRepository } from '../repositories/customer-address.js'

type InjectedDependencies = {
  customerRepository: CustomerRepository
  customerAddressRepository: CustomerAddressRepository
  withTransaction: WithTransaction
}

export class CustomerModuleService implements ICustomerModuleService {
  private customerRepository: CustomerRepository
  private customerAddressRepository: CustomerAddressRepository
  private withTransaction: WithTransaction

  constructor({ customerRepository, customerAddressRepository, withTransaction }: InjectedDependencies) {
    this.customerRepository = customerRepository
    this.customerAddressRepository = customerAddressRepository
    this.withTransaction = withTransaction
  }

  async retrieveCustomer(
    customerId: string,
    config?: FindConfig<CustomerDTO>,
    context?: Context,
  ): Promise<CustomerDTO> {
    return this.customerRepository.findByIdOrFail(customerId, config, context)
  }

  async retrieveCustomerWithAddresses(
    customerId: string,
    context?: Context,
  ): Promise<CustomerDTO & { addresses: CustomerAddressDTO[] }> {
    const customer = await this.customerRepository.findByIdOrFail(customerId, undefined, context)
    const addresses = await this.customerAddressRepository.find({ customer_id: customerId }, undefined, context)
    return { ...customer, addresses }
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
      const customers = await this.customerRepository.createMany(data, ctx)

      const addressData = customers.flatMap((customer, i) =>
        (data[i].addresses ?? []).map((addr) => ({ ...addr, customer_id: customer.id })),
      )
      if (addressData.length > 0) {
        await this.customerAddressRepository.createMany(addressData, ctx)
      }

      return customers
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
      await this.customerAddressRepository.softDeleteByCustomerIds(customerIds, ctx)
    })
  }

  async restoreCustomers(customerIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.customerRepository.restore(customerIds, ctx)
      await this.customerAddressRepository.restoreByCustomerIds(customerIds, ctx)
    })
  }

  // ── Customer Address ──

  async listCustomerAddresses(
    filters?: FilterableCustomerAddressProps,
    config?: FindConfig<CustomerAddressDTO>,
    context?: Context,
  ): Promise<CustomerAddressDTO[]> {
    return this.customerAddressRepository.find(filters, config, context)
  }

  async createCustomerAddresses(data: CreateCustomerAddressDTO[], context?: Context): Promise<CustomerAddressDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.customerAddressRepository.createMany(data, ctx)
    })
  }

  async updateCustomerAddresses(
    addressIds: string[],
    data: UpdateCustomerAddressDTO,
    context?: Context,
  ): Promise<CustomerAddressDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.customerAddressRepository.update(addressIds, data, ctx)
    })
  }
}
