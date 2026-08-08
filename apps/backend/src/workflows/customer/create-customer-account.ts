import type { CustomerDTO } from '@core/types/customer/common.js'
import type { CreateCustomerDTO } from '@core/types/customer/mutations.js'
import type { ICustomerModuleService } from '@core/types/customer/service.js'
import { Modules } from '@core/utils/index.js'
import { createWorkflow, WorkflowTerminalError } from '@core/workflows/types.js'
import { setAuthAppMetadataStep } from '../auth/steps/set-auth-app-metadata.js'

export type CreateCustomerAccountInput = {
  authIdentityId: string
  customerData: CreateCustomerDTO
}

export const createCustomerAccountWorkflow = createWorkflow<CreateCustomerAccountInput, CustomerDTO>(
  'create-customer-account',
  async (ctx, input) => {
    const customer = await ctx.step<CustomerDTO>(
      'create-customer',
      async ({ container }) => {
        const customerService = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
        const customers = await customerService.createCustomers([input.customerData])
        const created = customers[0]
        if (!created) {
          throw new WorkflowTerminalError('Expected customer to be created')
        }
        return created
      },
      async (createdCustomer, { container }) => {
        const customerService = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
        await customerService.softDeleteCustomers([createdCustomer.id])
      },
    )

    await setAuthAppMetadataStep(ctx, {
      authIdentityId: input.authIdentityId,
      actorType: 'customer',
      actorId: customer.id,
    })

    return customer
  },
)
