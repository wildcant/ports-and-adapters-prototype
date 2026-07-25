import type { RouteHandler } from '../../server/ports.js'
import { AppError, ErrorTypes } from '../errors/app-error.js'
import { formatZodIssues } from '../errors/format-zod-issues.js'
import { parseOrder, validateQuery } from '../utils/validate-query.js'
import type { MiddlewareRoute } from './types.js'

export function applyMiddleware(config: MiddlewareRoute, handler: RouteHandler): RouteHandler {
  return async (req) => {
    if (config.paramsSchema) {
      const result = config.paramsSchema.safeParse(req.params)
      if (!result.success) {
        throw new AppError({
          type: ErrorTypes.INVALID_DATA,
          message: `Invalid path params: ${formatZodIssues(result.error.issues)}`,
        })
      }
      req = { ...req, params: result.data as typeof req.params }
    }

    if (config.querySchema) {
      const validated = validateQuery(config.querySchema, req.query)
      const { offset, limit, order, ...filters } = validated as Record<string, unknown>
      req = {
        ...req,
        validatedQuery: {
          pagination: { offset, limit, order: parseOrder(order as string | undefined) },
          filters,
        },
      }
    }

    if (config.bodySchema) {
      const result = config.bodySchema.safeParse(req.body)
      if (!result.success) {
        throw new AppError({
          type: ErrorTypes.INVALID_DATA,
          message: `Invalid request body: ${formatZodIssues(result.error.issues)}`,
        })
      }
      req = { ...req, body: result.data }
    }

    return handler(req)
  }
}
