import type { ICartModuleService } from '@core/types/cart/service.js'
import type { ILinkService } from '@core/types/link/service.js'
import type { Logger } from '@core/types/logger.js'
import type { PaymentCollectionDTO } from '@core/types/payment/common.js'
import type { IPaymentModuleService } from '@core/types/payment/service.js'
import { ContainerRegistrationKeys, Modules } from '@core/utils/index.js'
import { createWorkflow, WorkflowTerminalError } from '@core/workflows/types.js'

type CreatePaymentCollectionForCartInput = { cartId: string }

export const createPaymentCollectionForCartWorkflow = createWorkflow<
  CreatePaymentCollectionForCartInput,
  PaymentCollectionDTO
>('create-payment-collection-for-cart', async (ctx, input) => {
  const paymentCollection = await ctx.step(
    'create-payment-collection',
    async ({ container }) => {
      const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
      const cartService = container.resolve<ICartModuleService>(Modules.CART)
      const paymentService = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
      const linkService = container.resolve<ILinkService>(ContainerRegistrationKeys.LINK)

      // Validate cart exists and has no existing payment collection
      const cart = await cartService.retrieveCart(input.cartId)

      if (cart.completedAt) {
        throw new WorkflowTerminalError(`Cart "${input.cartId}" is already completed`)
      }

      const existingLink = await linkService.repo('cartPaymentCollection').findByCartId(input.cartId)
      if (existingLink) {
        throw new WorkflowTerminalError(`Cart "${input.cartId}" already has a payment collection`)
      }

      // Compute cart total from line items
      const lineItems = await cartService.listLineItems({ cartId: input.cartId })
      const amount = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)

      if (amount <= 0) {
        throw new WorkflowTerminalError(`Cart "${input.cartId}" has no items or zero total`)
      }

      logger.debug(
        `[create-payment-collection-for-cart] Creating collection for cart "${input.cartId}" with amount ${amount}`,
      )

      const [collection] = await paymentService.createPaymentCollections([{ amount, currencyCode: cart.currencyCode }])

      await linkService.repo('cartPaymentCollection').create({
        cartId: input.cartId,
        paymentCollectionId: collection.id,
      })

      return collection
    },
    async (collection, { container }) => {
      const paymentService = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
      await paymentService.deletePaymentCollections([collection.id])
    },
  )

  return paymentCollection
})
