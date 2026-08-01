import {
  AdminCreateRefundReason,
  AdminCreateRefundReasonResponse,
  AdminRefundReasonListResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas/admin'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/refund-reasons',
    operationId: 'listRefundReasons',
    summary: 'List refund reasons',
    tags: [Tags.REFUND_REASONS],
    responseSchema: AdminRefundReasonListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/refund-reasons',
    bodySchema: AdminCreateRefundReason,
    operationId: 'createRefundReason',
    summary: 'Create a refund reason',
    tags: [Tags.REFUND_REASONS],
    responseSchema: AdminCreateRefundReasonResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/refund-reasons/:id',
    paramsSchema: IdParams,
    operationId: 'deleteRefundReason',
    summary: 'Delete a refund reason',
    tags: [Tags.REFUND_REASONS],
    responseSchema: DeleteResponse,
  },
] satisfies MiddlewareRoute[]
