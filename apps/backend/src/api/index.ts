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
import * as _customerByIdApi from './admin/customers/[id]/route.js'
import customerMiddlewares from './admin/customers/middlewares.js'
import * as _customersApi from './admin/customers/route.js'
import * as _userByIdApi from './admin/users/[id]/route.js'
import userMiddlewares from './admin/users/middlewares.js'
import * as _usersApi from './admin/users/route.js'

export { apiCall } from '../server/api-caller.js'

/** Wrap each handler (keyed by HTTP method) with the matching middleware config. */
function withMiddleware<T extends Record<string, RouteHandler>>(
  handlers: T,
  matcher: string,
  middlewares: MiddlewareRoute[],
): T {
  const wrapped = { ...handlers } as Record<string, RouteHandler>
  for (const config of middlewares) {
    if (config.matcher === matcher && wrapped[config.method]) {
      wrapped[config.method] = applyMiddleware(config, wrapped[config.method])
    }
  }
  return wrapped as T
}

export const usersApi = withMiddleware(_usersApi, '/admin/users', userMiddlewares)
export const userByIdApi = withMiddleware(_userByIdApi, '/admin/users/:id', userMiddlewares)
export const customersApi = withMiddleware(_customersApi, '/admin/customers', customerMiddlewares)
export const customerByIdApi = withMiddleware(_customerByIdApi, '/admin/customers/:id', customerMiddlewares)
