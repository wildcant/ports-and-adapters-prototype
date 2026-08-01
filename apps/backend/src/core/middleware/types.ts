import type { z } from 'zod'

export function searchable<T>(...columns: Array<keyof T & string>): string[] {
  return columns
}

export const Tags = {
  CARTS: 'Carts',
  CUSTOMERS: 'Customers',
  FULFILLMENTS: 'Fulfillments',
  FULFILLMENT_PROVIDERS: 'Fulfillment Providers',
  FULFILLMENT_SETS: 'Fulfillment Sets',
  PAYMENTS: 'Payments',
  PAYMENT_COLLECTIONS: 'Payment Collections',
  PRODUCTS: 'Products',
  REFUND_REASONS: 'Refund Reasons',
  SHIPPING_OPTIONS: 'Shipping Options',
  SHIPPING_PROFILES: 'Shipping Profiles',
  USERS: 'Users',
  WEBHOOKS: 'Webhooks',
} as const

export type Tag = (typeof Tags)[keyof typeof Tags]

type BaseRoute = {
  description?: string
  matcher: string
  operationId: string
  paramsSchema?: z.ZodType
  responseSchema?: z.ZodType
  summary?: string
  tags: Tag[]
}

type GetRoute = BaseRoute & {
  method: 'GET'
  querySchema?: z.ZodType
  searchableColumns?: string[]
}

type BodyRoute = BaseRoute & {
  method: 'POST' | 'PUT' | 'PATCH'
  bodySchema?: z.ZodType
}

type DeleteRoute = BaseRoute & {
  method: 'DELETE'
}

export type MiddlewareRoute = GetRoute | BodyRoute | DeleteRoute
