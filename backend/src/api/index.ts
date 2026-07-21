/**
 * Backend-as-library exports.
 *
 * When the frontend imports route handlers via `createServerFn`, there is no
 * HTTP layer — so the route loader's middleware never runs. This module wraps
 * each handler with the same middleware (validation, query parsing) that the
 * HTTP path applies, using the middleware configs as the single source of truth.
 */

import { applyMiddleware } from '../core/middleware/apply-middleware.js'
import type { MiddlewareRoute } from '../core/middleware/types.js'
import type { RouteHandler } from '../server/ports.js'
import * as _customerByIdApi from './customers/[id]/route.js'
import customerMiddlewares from './customers/middlewares.js'
import * as _customersApi from './customers/route.js'
import * as _userByIdApi from './users/[id]/route.js'
import userMiddlewares from './users/middlewares.js'
import * as _usersApi from './users/route.js'

export { apiCall } from '../server/api-caller.js'

/** Wrap each handler (keyed by HTTP method) with the matching middleware config. */
function withMiddleware(handlers: Record<string, RouteHandler>, matcher: string, middlewares: MiddlewareRoute[]) {
  const wrapped = { ...handlers }
  for (const config of middlewares) {
    if (config.matcher === matcher && wrapped[config.method]) {
      wrapped[config.method] = applyMiddleware(config, wrapped[config.method])
    }
  }
  return wrapped
}

export const usersApi = withMiddleware(_usersApi as Record<string, RouteHandler>, '/users', userMiddlewares)
export const userByIdApi = withMiddleware(_userByIdApi as Record<string, RouteHandler>, '/users/:id', userMiddlewares)
export const customersApi = withMiddleware(
  _customersApi as Record<string, RouteHandler>,
  '/customers',
  customerMiddlewares,
)
export const customerByIdApi = withMiddleware(
  _customerByIdApi as Record<string, RouteHandler>,
  '/customers/:id',
  customerMiddlewares,
)
