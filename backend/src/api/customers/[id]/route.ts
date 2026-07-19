import type { UpdateCustomer } from '@core/http-schemas/index.js'
import type { ICustomerModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { z } from 'zod'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(req.params.id)
  return { status: 200, json: { customer } }
}

export const PATCH = async (req: HttpRequest<z.infer<typeof UpdateCustomer>>): Promise<HttpResult> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const [customer] = await customerService.updateCustomers([req.params.id], req.body)
  return { status: 200, json: { customer } }
}

export const DELETE = async (req: HttpRequest): Promise<HttpResult> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  await customerService.softDeleteCustomers([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
