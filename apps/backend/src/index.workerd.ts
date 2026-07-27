/** Workers + Express entry point via httpServerHandler. */

import { httpServerHandler } from 'cloudflare:node'
import { Readable } from 'node:stream'
import express from 'express'
import { container, dbProvider } from './container.workerd.js'
import { createRegistry, generateDocument } from './core/openapi/registry.js'
import type { Logger } from './core/types/logger.js'
import { ContainerRegistrationKeys } from './core/utils/index.js'
import { registerStaticRoutes } from './routes-static.js'
import { createApp } from './server/app.js'

const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)

// ---- App (universal, no framework dependency) ----

const app = createApp({ container })

// ---- Static routing (no filesystem scanning) ----

const adminRegistry = createRegistry()
const storeRegistry = createRegistry()

logger.info('Registering routes:')
registerStaticRoutes(app, logger, (routePath) => {
  if (routePath.startsWith('/admin/')) return adminRegistry
  if (routePath.startsWith('/store/')) return storeRegistry
  return undefined
})

// ---- OpenAPI ----

app.addRoute('GET', '/admin/openapi.json', async () => ({
  status: 200,
  json: generateDocument(adminRegistry, 'Admin API'),
}))

app.addRoute('GET', '/store/openapi.json', async () => ({
  status: 200,
  json: generateDocument(storeRegistry, 'Store API'),
}))

// ---- Platform: Express on Workers ----

const server = express()

server.all('*', async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method)
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    duplex: hasBody ? 'half' : undefined,
  } as RequestInit)

  const handle = () => app.fetch(request)
  const response = req.method === 'OPTIONS'
    ? await handle()
    : await dbProvider.withConnection(handle)
  response.headers.forEach((value, key) => { res.setHeader(key, value) })

  if (response.status === 204) {
    res.status(204).end()
    return
  }

  const body = await response.json()
  res.status(response.status).json(body)
})

server.listen(3000)

export default httpServerHandler({ port: 3000 })
