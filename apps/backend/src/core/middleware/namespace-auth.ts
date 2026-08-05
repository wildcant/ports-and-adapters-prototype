import { authenticate } from '../auth/middleware/authenticate.js'
import type { MiddlewareFunction, MiddlewareRoute } from './types.js'

function getNamespaceAuth(routePath: string): MiddlewareFunction | undefined {
  if (routePath.startsWith('/admin/')) return authenticate('user')
  if (routePath.startsWith('/store/')) return authenticate('customer')
  return undefined
}

/**
 * If the route config has no explicit `middlewares[]`, inject the namespace auth default.
 */
export function applyNamespaceAuth(config: MiddlewareRoute, routePath: string): void {
  if (config.middlewares) return
  const namespaceAuthMiddleware = getNamespaceAuth(routePath)
  if (namespaceAuthMiddleware) config.middlewares = [namespaceAuthMiddleware]
}
