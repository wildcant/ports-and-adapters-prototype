import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type { CustomerDTO, FilterableCustomerProps } from './common.js'
import type { CreateCustomerDTO, UpdateCustomerDTO } from './mutations.js'

export type ICustomerModuleService = {
  retrieveCustomer(customerId: string, config?: FindConfig<CustomerDTO>, context?: Context): Promise<CustomerDTO>
  listCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context?: Context,
  ): Promise<CustomerDTO[]>
  listAndCountCustomers(
    filters?: FilterableCustomerProps,
    config?: FindConfig<CustomerDTO>,
    context?: Context,
  ): Promise<[CustomerDTO[], number]>
  createCustomers(data: CreateCustomerDTO[], context?: Context): Promise<CustomerDTO[]>
  updateCustomers(customerIds: string[], data: UpdateCustomerDTO, context?: Context): Promise<CustomerDTO[]>
  deleteCustomers(customerIds: string[], context?: Context): Promise<void>
  softDeleteCustomers(customerIds: string[], context?: Context): Promise<void>
  restoreCustomers(customerIds: string[], context?: Context): Promise<void>
}
