import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import type { ICustomerModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import type {
  AdminCustomerResponse,
  AdminUpdateCustomerBody,
  AdminUpdateCustomerResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas/admin'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

type RetrieveCustomerInput = { params: IdParams }
export const GET = async (req: HttpRequest<RetrieveCustomerInput>): Promise<HttpResult<AdminCustomerResponse>> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(req.params.id)
  return { status: 200, json: { customer } }
}

type UpdateCustomerInput = { params: IdParams; body: AdminUpdateCustomerBody }
export const PATCH = async (
  req: HttpRequest<UpdateCustomerInput>,
): Promise<HttpResult<AdminUpdateCustomerResponse>> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const [customer] = await customerService.updateCustomers([req.params.id], req.body)
  if (!customer) {
    throw new AppError({ type: ErrorTypes.NOT_FOUND, message: `Customer with id "${req.params.id}" not found` })
  }
  return { status: 200, json: { customer } }
}

type DeleteCustomerInput = { params: IdParams }
export const DELETE = async (req: HttpRequest<DeleteCustomerInput>): Promise<HttpResult<DeleteResponse>> => {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  await customerService.softDeleteCustomers([req.params.id])
  return { status: 200, json: { id: req.params.id, deleted: true } }
}
