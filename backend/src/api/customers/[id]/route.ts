import type { IdParams } from '@core/http-schemas/common.js'
import type { UpdateCustomerBody } from '@core/http-schemas/customer/payloads.js'
import type { ICustomerModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

type RetrieveCustomerInput = { params: IdParams }
export const GET = async (req: HttpRequest<RetrieveCustomerInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(req.params.id)
  return { status: 200, json: { customer } } satisfies HttpResult
}

type UpdateCustomerInput = { params: IdParams; body: UpdateCustomerBody }
export const PATCH = async (req: HttpRequest<UpdateCustomerInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const [customer] = await customerService.updateCustomers([req.params.id], req.body)
  return { status: 200, json: { customer } } satisfies HttpResult
}

type DeleteCustomerInput = { params: IdParams }
export const DELETE = async (req: HttpRequest<DeleteCustomerInput>) => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  await customerService.softDeleteCustomers([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } } satisfies HttpResult
}
