import { join } from 'node:path'
import { container } from './container.js'
import { generateDocument } from './core/openapi/registry.js'
import type { Logger } from './core/types/logger.js'
import { ContainerRegistrationKeys } from './core/utils/index.js'
import { loadRoutes } from './routes-loader.js'
import { createApp } from './server/app.js'
import { serveExpress } from './server/platforms.js'

const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)

// ---- App (universal, no framework dependency) ----

const app = createApp({ container })

// ---- File-based routing ----

logger.info('Registering routes:')
await loadRoutes(app, join(import.meta.dirname, 'api'), logger)

// ---- OpenAPI ----

app.addRoute('GET', '/openapi.json', async () => ({
  status: 200,
  json: generateDocument(),
}))

// ---- Platform: Node.js ----

serveExpress(app, 3000, () => {
  logger.info('Server running at http://localhost:3000')
})
