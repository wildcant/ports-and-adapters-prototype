import { container } from './container.node.js'
import { createRegistry, generateDocument } from './core/openapi/registry.js'
import type { Logger } from './core/types/logger.js'
import { ContainerRegistrationKeys } from './core/utils/index.js'
import { registerRoutes } from './routes.js'
import { createApp } from './server/app.js'
import { serveExpress } from './server/platforms.js'
import type { RouteHandler } from './server/ports.js'

const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)

// ---- App (universal, no framework dependency) ----

const app = createApp({ container })

// ---- Static routing ----

const adminRegistry = createRegistry()
const storeRegistry = createRegistry()

logger.info('Registering routes:')
registerRoutes(app, logger, { admin: adminRegistry, store: storeRegistry })

// ---- OpenAPI ----

app.addRoute('GET', '/admin/openapi.json', (async () => ({
  status: 200,
  json: generateDocument(adminRegistry, 'Admin API'),
})) as RouteHandler)

app.addRoute('GET', '/store/openapi.json', (async () => ({
  status: 200,
  json: generateDocument(storeRegistry, 'Store API'),
})) as RouteHandler)

// ---- Platform: Node.js ----

serveExpress(
  app,
  3000,
  () => {
    logger.info('Server running at http://localhost:3000')
  },
  [
    { path: '/admin/docs', document: generateDocument(adminRegistry, 'Admin API') },
    { path: '/store/docs', document: generateDocument(storeRegistry, 'Store API') },
  ],
)
