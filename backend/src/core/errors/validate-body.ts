import type { z } from 'zod'
import { AppError, ErrorTypes } from './app-error.js'
import { formatZodIssues } from './format-zod-issues.js'

export function validateBody<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (result.success) {
    return result.data
  }

  const formatted = formatZodIssues(result.error.issues)

  throw new AppError({
    type: ErrorTypes.INVALID_DATA,
    message: `Invalid request body: ${formatted}`,
  })
}
