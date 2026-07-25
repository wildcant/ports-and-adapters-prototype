import { ProviderParams } from '../../core/http-schemas/payment/payloads.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'POST',
    matcher: '/hooks/payment/:provider',
    paramsSchema: ProviderParams,
    operationId: 'paymentWebhook',
    summary: 'Handle payment provider webhook',
    tags: [Tags.WEBHOOKS],
  },
] satisfies MiddlewareRoute[]
