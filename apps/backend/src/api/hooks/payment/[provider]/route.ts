import type { IPaymentModuleService } from '@core/types/index.js'
import type { Logger } from '@core/types/logger.js'
import type { PaymentActions } from '@core/types/payment/common.js'
import { ContainerRegistrationKeys, Modules } from '@core/utils/index.js'
import { ProviderParams, WebhookReceivedResponse } from '@proteus/http-schemas/store'
import type { HttpRequest, HttpResult } from '../../../../server/ports.js'

const SKIP_ACTIONS: Set<PaymentActions> = new Set([
  'not_supported',
  'canceled',
  'failed',
  'requires_more',
  'pending_authorization',
])

export const PostInput = { params: ProviderParams }
export const PostOutput = WebhookReceivedResponse

export const POST = async (req: HttpRequest<typeof PostInput>): Promise<HttpResult<typeof PostOutput>> => {
  const logger = req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
  const paymentService = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)

  const { action, data } = await paymentService.getWebhookActionAndData({
    provider: req.params.provider,
    payload: {
      data: (req.body ?? {}) as Record<string, unknown>,
      rawData: JSON.stringify(req.body ?? {}),
      headers: req.headers,
    },
  })

  logger.info(`Webhook from "${req.params.provider}": action="${action}", sessionId="${data?.sessionId}"`)

  if (SKIP_ACTIONS.has(action) || !data?.sessionId) {
    return { status: 200, json: { received: true } }
  }

  // TODO: Move to event/subscriber pattern with configurable delay for race condition handling
  if (action === 'authorized' || action === 'captured') {
    const payment = await paymentService.authorizePaymentSession(data.sessionId)

    if (action === 'captured' && payment) {
      await paymentService.capturePayment({ paymentId: payment.id, amount: data.amount })
    }
  }

  return { status: 200, json: { received: true } }
}
