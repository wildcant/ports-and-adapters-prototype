import type { CreateCustomersBody } from '@core/http-schemas/customer/payloads.js'
import type { CustomerListQuery } from '@core/http-schemas/customer/queries.js'
import type { ICustomerModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../server/ports.js'

type ListCustomersInput = { query: CustomerListQuery }
export const GET = async (req: HttpRequest<ListCustomersInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const { pagination, filters } = req.validatedQuery
  const [customers, count] = await customerService.listAndCountCustomers(filters, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { customers, count, offset, limit } } satisfies HttpResult
}

type CreateCustomersInput = { body: CreateCustomersBody }
export const POST = async (req: HttpRequest<CreateCustomersInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(req.body)
  return { status: 201, json: { customers } } satisfies HttpResult
}
