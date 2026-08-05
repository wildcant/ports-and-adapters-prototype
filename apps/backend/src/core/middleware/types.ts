import type { z } from 'zod'
import type { HttpRequest } from '../../server/ports.js'

export type MiddlewareFunction = (req: HttpRequest) => HttpRequest | Promise<HttpRequest>

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
  PRODUCT_VARIANTS: 'Product Variants',
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
  middlewares?: MiddlewareFunction[]
  operationId: string
  paramsSchema?: z.ZodType
  responseSchema: z.ZodType
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
