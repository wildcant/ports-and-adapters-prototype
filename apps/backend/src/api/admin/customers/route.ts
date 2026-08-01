import type { ICustomerModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { AdminCreateCustomersBody, AdminCustomerListQuery } from '@proteus/http-schemas'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type ListCustomersInput = { query: AdminCustomerListQuery }
export const GET = async (req: HttpRequest<ListCustomersInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const { pagination, filters } = req.validatedQuery
  const [customers, count] = await customerService.listAndCountCustomers(filters, pagination)
  const { offset, limit } = pagination
  return { status: 200, json: { customers, count, offset, limit } } satisfies HttpResult
}

type CreateCustomersInput = { body: AdminCreateCustomersBody }
export const POST = async (req: HttpRequest<CreateCustomersInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(req.body)
  return { status: 201, json: { customers } } satisfies HttpResult
}
