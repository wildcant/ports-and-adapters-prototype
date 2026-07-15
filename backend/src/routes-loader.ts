import { readdirSync, statSync } from "fs"
import { join, sep } from "path"
import type { App } from "./server/ports.js"

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const

/**
 * Recursively find all route.ts files under a directory.
 */
function findRouteFiles(dir: string): string[] {
  const results: string[] = []

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findRouteFiles(full))
    } else if (entry === "route.ts" || entry === "route.js") {
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
    .replace(/route\.(ts|js)$/, "")
    .split(sep)
    .filter(Boolean)
    .map((segment) => {
      const match = segment.match(/^\[(\w+)\]$/)
      return match ? `:${match[1]}` : segment
    })

  return `/${segments.join("/")}`
}

/**
 * Scan a source directory for route files and register them with the HttpServer.
 */
export async function loadRoutes(server: App, sourceDir: string) {
  const routeFiles = findRouteFiles(sourceDir)

  for (const absolutePath of routeFiles) {
    const relativePath = absolutePath.replace(sourceDir + sep, "")
    const routePath = filePathToRoute(relativePath)

    const routeExports = await import(absolutePath)

    for (const method of HTTP_METHODS) {
      if (typeof routeExports[method] === "function") {
        server.addRoute(method, routePath, routeExports[method])
        console.log(`  ${method} ${routePath}  <-  ${relativePath}`)
      }
    }
  }
}
