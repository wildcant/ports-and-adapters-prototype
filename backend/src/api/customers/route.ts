import type { CreateCustomerDTO, ICustomerModuleService } from '../../core/types/index.js'
import { Modules } from '../../core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const [customers, count] = await customerService.listAndCountCustomers()
  return { status: 200, json: { customers, count } }
}

export const POST = async (req: HttpRequest<CreateCustomerDTO[]>): Promise<HttpResult> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(req.body)
  return { status: 201, json: { customers } }
}
