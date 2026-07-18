import type { FindConfig } from '../common.js'
import type { SharedContext } from '../shared-context.js'
import type { CustomerDTO, FilterableCustomerProps } from './common.js'
import type { CreateCustomerDTO, UpdateCustomerDTO } from './mutations.js'

export type ICustomerModuleService = {
  retrieveCustomer(customerId: string, config?: FindConfig<CustomerDTO>, context?: SharedContext): Promise<CustomerDTO>
  listCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context?: SharedContext,
  ): Promise<CustomerDTO[]>
  listAndCountCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context?: SharedContext,
  ): Promise<[CustomerDTO[], number]>
  createCustomers(data: CreateCustomerDTO, context?: SharedContext): Promise<CustomerDTO>
  updateCustomers(customerId: string, data: UpdateCustomerDTO, context?: SharedContext): Promise<CustomerDTO>
  deleteCustomers(customerId: string, context?: SharedContext): Promise<void>
  softDeleteCustomers(customerIds: string[], context?: SharedContext): Promise<void>
  restoreCustomers(customerIds: string[], context?: SharedContext): Promise<void>
}
