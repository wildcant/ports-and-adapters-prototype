/**
 * MINIMAL ROUTER -- Zero-dependency App implementation.
 *
 * Builds a Web Standard fetch handler from registered routes.
 * No Express, no Hono -- just Request -> Response.
 * Runs everywhere: Node.js, Vercel, Lambda, CF Workers, Bun, Deno.
 */

import type { AwilixContainer } from "awilix"
import type { App, CreateApp, RouteHandler } from "./ports.js"

type Route = {
  method: string
  pattern: RegExp
  paramNames: string[]
  handler: RouteHandler
}

/**
 * Convert "/identity/:id" to a regex + param names.
 */
function compilePath(path: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = []
  const regexStr = path.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name)
    return "([^/]+)"
  })
  return { pattern: new RegExp(`^${regexStr}$`), paramNames }
}

export const createApp: CreateApp = ({ container }) => {
  const routes: Route[] = []

  const app: App = {
    addRoute(method, path, handler) {
      const { pattern, paramNames } = compilePath(path)
      routes.push({ method: method.toUpperCase(), pattern, paramNames, handler })
    },

    async fetch(request) {
      const url = new URL(request.url)
      const method = request.method.toUpperCase()
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }

      // Handle CORS preflight
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders })
      }

      for (const route of routes) {
        if (route.method !== method) continue
        const match = url.pathname.match(route.pattern)
        if (!match) continue

        const params: Record<string, string> = {}
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1]
        })

        const body = ["GET", "HEAD", "DELETE"].includes(method)
          ? undefined
          : await request.json().catch(() => undefined)

        const result = await route.handler({
          params,
          body,
          scope: container.createScope(),
        })

        return Response.json(result.json, { status: result.status, headers: corsHeaders })
      }

      return Response.json({ error: "Not Found" }, { status: 404, headers: corsHeaders })
    },
  }

  return app
}
