import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { applyMiddleware } from './core/middleware/apply-middleware.js'
import type { MiddlewareRoute } from './core/middleware/types.js'
import { registerOpenApiRoutes } from './core/openapi/register-route.js'
import type { Logger } from './core/types/logger.js'
import type { App } from './server/ports.js'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

/**
 * Recursively find all route.ts files under a directory.
 */
function findRouteFiles(dir: string): string[] {
  const results: string[] = []

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findRouteFiles(full))
    } else if (entry === 'route.ts' || entry === 'route.js') {
      results.push(full)
    }
  }

  return results
}

/**
 * Convert a file path relative to the source dir into a route pattern.
 *
 *   "users/[id]/route.ts"  ->  "/users/:id"
 */
function filePathToRoute(relativePath: string): string {
  const segments = relativePath
    .replace(/route\.(ts|js)$/, '')
    .split(sep)
    .filter(Boolean)
    .map((segment) => {
      const match = segment.match(/^\[(\w+)\]$/)
      return match ? `:${match[1]}` : segment
    })

  return `/${segments.join('/')}`
}

/**
 * Find the nearest middlewares.ts file for a given route file.
 * Walks up from the route file's directory until it reaches sourceDir.
 */
function findMiddlewarePath(routeFilePath: string, sourceDir: string): string | null {
  let dir = join(routeFilePath, '..')
  while (dir.startsWith(sourceDir)) {
    const candidate = join(dir, 'middlewares.ts')
    if (existsSync(candidate)) return candidate
    if (dir === sourceDir) break
    dir = join(dir, '..')
  }
  return null
}

/**
 * Scan a source directory for route files and register them with the HttpServer.
 */
export type RegistryResolver = (routePath: string) => OpenAPIRegistry | undefined

export async function loadRoutes(server: App, sourceDir: string, logger: Logger, resolveRegistry?: RegistryResolver) {
  const routeFiles = findRouteFiles(sourceDir)
  const middlewareCache = new Map<string, MiddlewareRoute[]>()

  for (const absolutePath of routeFiles) {
    const relativePath = absolutePath.replace(sourceDir + sep, '')
    const routePath = filePathToRoute(relativePath)

    // Load middleware config (cached per file)
    const middlewarePath = findMiddlewarePath(absolutePath, sourceDir)
    let middlewareConfigs: MiddlewareRoute[] = []
    if (middlewarePath) {
      if (!middlewareCache.has(middlewarePath)) {
        const mod = await import(middlewarePath)
        const configs = mod.default ?? []
        middlewareCache.set(middlewarePath, configs)
        if (resolveRegistry && configs.length > 0) {
          const registry = resolveRegistry(configs[0].matcher)
          if (registry) registerOpenApiRoutes(registry, configs)
        }
      }
      middlewareConfigs = middlewareCache.get(middlewarePath) ?? []
    }

    const routeExports = await import(absolutePath)

    for (const method of HTTP_METHODS) {
      if (typeof routeExports[method] !== 'function') continue

      let handler = routeExports[method]

      // Match middleware by path and method
      const config = middlewareConfigs.find((m) => m.matcher === routePath && m.method === method)
      if (config) {
        handler = applyMiddleware(config, handler)
      }

      server.addRoute(method, routePath, handler)
      logger.info(`  ${method} ${routePath}  <-  ${relativePath}`)
    }
  }
}
