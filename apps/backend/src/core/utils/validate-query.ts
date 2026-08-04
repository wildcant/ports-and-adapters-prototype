import type { z } from 'zod'
import { AppError, ErrorTypes } from '../errors/app-error.js'
import { formatZodIssues } from '../errors/format-zod-issues.js'

export function validateQuery<T>(schema: z.ZodType<T>, query: Record<string, unknown>): T {
  const result = schema.safeParse(query)

  if (!result.success) {
    throw new AppError({
      type: ErrorTypes.INVALID_DATA,
      message: `Invalid query params: ${formatZodIssues(result.error.issues)}`,
    })
  }

  return result.data
}

export function parseOrder(order?: string): Record<string, 'ASC' | 'DESC'> | undefined {
  if (!order) return undefined
  if (order.startsWith('-')) {
    return { [order.slice(1)]: 'DESC' }
  }
  return { [order]: 'ASC' }
}
