import type { z } from 'zod'

export const Tags = {
  CUSTOMERS: 'Customers',
  IDENTITY: 'Identity',
} as const

export type Tag = (typeof Tags)[keyof typeof Tags]

export type MiddlewareRoute = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  matcher: string
  paramsSchema?: z.ZodType
  querySchema?: z.ZodType
  bodySchema?: z.ZodType
  responseSchema?: z.ZodType
  summary?: string
  description?: string
  tags?: Tag[]
}
