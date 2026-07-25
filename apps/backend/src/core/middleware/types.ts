import type { z } from 'zod'

export const Tags = {
  CUSTOMERS: 'Customers',
  USERS: 'Users',
  PAYMENTS: 'Payments',
  PAYMENT_COLLECTIONS: 'Payment Collections',
  REFUND_REASONS: 'Refund Reasons',
  WEBHOOKS: 'Webhooks',
} as const

export type Tag = (typeof Tags)[keyof typeof Tags]

export type MiddlewareRoute = {
  bodySchema?: z.ZodType
  description?: string
  matcher: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  operationId: string
  paramsSchema?: z.ZodType
  querySchema?: z.ZodType
  responseSchema?: z.ZodType
  summary?: string
  tags: Tag[]
}
