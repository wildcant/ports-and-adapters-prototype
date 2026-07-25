import type { z } from 'zod'
import { AppError, ErrorTypes } from '../errors/app-error.js'
import { formatZodIssues } from '../errors/format-zod-issues.js'

/**
 * Normalize query params: single-element arrays with comma-separated
 * values are split into proper arrays.
 * e.g. { fields: "id,status" } → { fields: ["id", "status"] }
 */
function normalizeQuery(query: Record<string, string | string[]>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(query)) {
    if (typeof val === 'string' && val.includes(',')) {
      normalized[key] = val.split(',')
    } else {
      normalized[key] = val
    }
  }

  return normalized
}

export function validateQuery<T>(schema: z.ZodType<T>, rawQuery: Record<string, string | string[]>): T {
  const normalized = normalizeQuery(rawQuery)
  const result = schema.safeParse(normalized)

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
