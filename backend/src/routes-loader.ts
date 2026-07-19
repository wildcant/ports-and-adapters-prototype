import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { applyMiddleware } from './core/middleware/apply-middleware.js'
import type { MiddlewareRoute } from './core/middleware/types.js'
import { registerOpenApiRoute } from './core/openapi/register-route.js'
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
 *   "identity/[id]/route.ts"  ->  "/identity/:id"
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
 * Find the middlewares.ts file for a given route file.
 * Looks in the top-level API subdirectory (one level deep from sourceDir).
 */
function findMiddlewarePath(routeFilePath: string, sourceDir: string): string | null {
  const relativePath = routeFilePath.replace(sourceDir + sep, '')
  const topDir = relativePath.split(sep)[0]
  const middlewarePath = join(sourceDir, topDir, 'middlewares.ts')
  return existsSync(middlewarePath) ? middlewarePath : null
}

/**
 * Scan a source directory for route files and register them with the HttpServer.
 */
export async function loadRoutes(server: App, sourceDir: string) {
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
        middlewareCache.set(middlewarePath, mod.default ?? [])
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
        registerOpenApiRoute(routePath, config)
      }

      server.addRoute(method, routePath, handler)
      console.log(`  ${method} ${routePath}  <-  ${relativePath}`)
    }
  }
}
