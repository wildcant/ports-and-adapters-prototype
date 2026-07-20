import type { CreateCustomers } from '@core/http-schemas/index.js'
import type { ICustomerModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { z } from 'zod'
import type { HttpRequest, HttpResult } from '../../server/ports.js'

export const GET = async (req: HttpRequest) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const [customers, count] = await customerService.listAndCountCustomers()
  return { status: 200, json: { customers, count } } satisfies HttpResult
}

export const POST = async (req: HttpRequest<z.infer<typeof CreateCustomers>>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customers = await customerService.createCustomers(req.body)
  return { status: 201, json: { customers } } satisfies HttpResult
}
