/**
 * Static route manifest for Workers — no filesystem scanning needed.
 * Mirrors what loadRoutes() does at runtime, but with static imports
 * so esbuild can bundle everything.
 */

import { applyMiddleware } from './core/middleware/apply-middleware.js'
import { applyNamespaceAuth } from './core/middleware/namespace-auth.js'
import type { MiddlewareRoute } from './core/middleware/types.js'
import { registerOpenApiRoutes } from './core/openapi/register-route.js'
import type { Logger } from './core/types/logger.js'
import type { RegistryResolver } from './routes-loader.js'
import type { App, RouteHandler } from './server/ports.js'

// ---- Middleware imports ----

import adminCustomersMw from './api/admin/customers/middlewares.js'
import adminPaymentCollectionsMw from './api/admin/payment-collections/middlewares.js'
import adminPaymentsMw from './api/admin/payments/middlewares.js'
import adminRefundReasonsMw from './api/admin/refund-reasons/middlewares.js'
import adminUsersMw from './api/admin/users/middlewares.js'
import hooksMw from './api/hooks/middlewares.js'
import storeCartsMw from './api/store/carts/middlewares.js'
import storePaymentCollectionsMw from './api/store/payment-collections/middlewares.js'
import storePaymentProvidersMw from './api/store/payment-providers/middlewares.js'
import storeProductsMw from './api/store/products/middlewares.js'

// ---- Route imports ----

import * as adminCustomersById from './api/admin/customers/[id]/route.js'
import * as adminCustomers from './api/admin/customers/route.js'
import * as adminPaymentCollectionsByIdMarkAsPaid from './api/admin/payment-collections/[id]/mark-as-paid/route.js'
import * as adminPaymentCollectionsById from './api/admin/payment-collections/[id]/route.js'
import * as adminPaymentsByIdCapture from './api/admin/payments/[id]/capture/route.js'
import * as adminPaymentsByIdRefund from './api/admin/payments/[id]/refund/route.js'
import * as adminPaymentsById from './api/admin/payments/[id]/route.js'
import * as adminPaymentProviders from './api/admin/payments/payment-providers/route.js'
import * as adminRefundReasonsById from './api/admin/refund-reasons/[id]/route.js'
import * as adminRefundReasons from './api/admin/refund-reasons/route.js'
import * as adminUsersById from './api/admin/users/[id]/route.js'
import * as adminUsers from './api/admin/users/route.js'
import * as hooksPaymentByProvider from './api/hooks/payment/[provider]/route.js'
import * as storeCartsByIdComplete from './api/store/carts/[id]/complete/route.js'
import * as storeCartsByIdInventory from './api/store/carts/[id]/inventory/route.js'
import * as storeCartsByIdLineItemsByLineId from './api/store/carts/[id]/line-items/[lineId]/route.js'
import * as storeCartsByIdLineItems from './api/store/carts/[id]/line-items/route.js'
import * as storeCartsById from './api/store/carts/[id]/route.js'
import * as storeCarts from './api/store/carts/route.js'
import * as storePaymentCollectionsByIdPaymentSessions from './api/store/payment-collections/[id]/payment-sessions/route.js'
import * as storePaymentCollections from './api/store/payment-collections/route.js'
import * as storePaymentProviders from './api/store/payment-providers/route.js'
import * as storeProductsById from './api/store/products/[id]/route.js'
import * as storeProducts from './api/store/products/route.js'

// ---- Registration ----

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

type RouteEntry = {
  path: string
  module: Record<string, unknown>
  middlewares: MiddlewareRoute[]
}

const routes: RouteEntry[] = [
  { path: '/admin/customers/:id', module: adminCustomersById, middlewares: adminCustomersMw },
  { path: '/admin/customers', module: adminCustomers, middlewares: adminCustomersMw },
  {
    path: '/admin/payment-collections/:id/mark-as-paid',
    module: adminPaymentCollectionsByIdMarkAsPaid,
    middlewares: adminPaymentCollectionsMw,
  },
  {
    path: '/admin/payment-collections/:id',
    module: adminPaymentCollectionsById,
    middlewares: adminPaymentCollectionsMw,
  },
  { path: '/admin/payments/:id/capture', module: adminPaymentsByIdCapture, middlewares: adminPaymentsMw },
  { path: '/admin/payments/:id/refund', module: adminPaymentsByIdRefund, middlewares: adminPaymentsMw },
  { path: '/admin/payments/:id', module: adminPaymentsById, middlewares: adminPaymentsMw },
  { path: '/admin/payments/payment-providers', module: adminPaymentProviders, middlewares: adminPaymentsMw },
  { path: '/admin/refund-reasons/:id', module: adminRefundReasonsById, middlewares: adminRefundReasonsMw },
  { path: '/admin/refund-reasons', module: adminRefundReasons, middlewares: adminRefundReasonsMw },
  { path: '/admin/users/:id', module: adminUsersById, middlewares: adminUsersMw },
  { path: '/admin/users', module: adminUsers, middlewares: adminUsersMw },
  { path: '/hooks/payment/:provider', module: hooksPaymentByProvider, middlewares: hooksMw },
  { path: '/store/carts/:id/complete', module: storeCartsByIdComplete, middlewares: storeCartsMw },
  { path: '/store/carts/:id/inventory', module: storeCartsByIdInventory, middlewares: storeCartsMw },
  { path: '/store/carts/:id/line-items/:lineId', module: storeCartsByIdLineItemsByLineId, middlewares: storeCartsMw },
  { path: '/store/carts/:id/line-items', module: storeCartsByIdLineItems, middlewares: storeCartsMw },
  { path: '/store/carts/:id', module: storeCartsById, middlewares: storeCartsMw },
  { path: '/store/carts', module: storeCarts, middlewares: storeCartsMw },
  {
    path: '/store/payment-collections/:id/payment-sessions',
    module: storePaymentCollectionsByIdPaymentSessions,
    middlewares: storePaymentCollectionsMw,
  },
  { path: '/store/payment-collections', module: storePaymentCollections, middlewares: storePaymentCollectionsMw },
  { path: '/store/payment-providers', module: storePaymentProviders, middlewares: storePaymentProvidersMw },
  { path: '/store/products/:id', module: storeProductsById, middlewares: storeProductsMw },
  { path: '/store/products', module: storeProducts, middlewares: storeProductsMw },
]

export function registerStaticRoutes(app: App, logger: Logger, resolveRegistry?: RegistryResolver) {
  // Register OpenAPI specs from middleware configs
  const registeredMw = new Set<MiddlewareRoute[]>()
  if (resolveRegistry) {
    for (const { middlewares } of routes) {
      const first = middlewares[0]
      if (registeredMw.has(middlewares) || !first) continue
      registeredMw.add(middlewares)
      const registry = resolveRegistry(first.matcher)
      if (registry) registerOpenApiRoutes(registry, middlewares)
    }
  }

  // Register route handlers
  for (const { path, module, middlewares } of routes) {
    for (const method of HTTP_METHODS) {
      const handler = module[method]
      if (typeof handler !== 'function') continue

      const config = middlewares.find((m) => m.matcher === path && m.method === method)
      if (config) applyNamespaceAuth(config, path)
      const finalHandler = config ? applyMiddleware(config, handler as RouteHandler) : (handler as RouteHandler)

      app.addRoute(method, path, finalHandler)
      logger.info(`  ${method} ${path}`)
    }
  }
}
