import type { z } from 'zod'
import { AppError, ErrorTypes } from './app-error.js'
import { formatZodIssues } from './format-zod-issues.js'

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

export function validateQuery<T>(schema: z.ZodType<T>, query: Record<string, string | string[]>): T {
  const normalized = normalizeQuery(query)
  const result = schema.safeParse(normalized)

  if (result.success) {
    return result.data
  }

  const formatted = formatZodIssues(result.error.issues)

  throw new AppError({
    type: ErrorTypes.INVALID_DATA,
    message: `Invalid query params: ${formatted}`,
  })
}
