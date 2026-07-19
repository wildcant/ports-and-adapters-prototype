import type { RouteHandler } from '../../server/ports.js'
import { AppError, ErrorTypes } from '../errors/app-error.js'
import { formatZodIssues } from '../errors/format-zod-issues.js'
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
      const result = config.querySchema.safeParse(req.query)
      if (!result.success) {
        throw new AppError({
          type: ErrorTypes.INVALID_DATA,
          message: `Invalid query params: ${formatZodIssues(result.error.issues)}`,
        })
      }
      req = { ...req, query: result.data as typeof req.query }
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
