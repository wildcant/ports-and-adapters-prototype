/**
 * MINIMAL ROUTER -- Zero-dependency App implementation.
 *
 * Builds a Web Standard fetch handler from registered routes.
 * No Express, no Hono -- just Request -> Response.
 * Runs everywhere: Node.js, Vercel, Lambda, CF Workers, Bun, Deno.
 */

import qs from 'qs'
import { errorHandler } from '../core/errors/index.js'
import type { Logger } from '../core/types/logger.js'
import { ContainerRegistrationKeys } from '../core/utils/index.js'
import { env } from '../env.js'
import type { App, CreateApp, RouteHandler } from './ports.js'

type Route = {
  method: string
  pattern: RegExp
  paramNames: string[]
  handler: RouteHandler
}

/**
 * Convert "/users/:id" to a regex + param names.
 */
function compilePath(path: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = []
  const regexStr = path.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name)
    return '([^/]+)'
  })
  return { pattern: new RegExp(`^${regexStr}$`), paramNames }
}

export const createApp: CreateApp = ({ container }) => {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const routes: Route[] = []

  const app: App = {
    addRoute(method, path, handler) {
      const { pattern, paramNames } = compilePath(path)
      routes.push({ method: method.toUpperCase(), pattern, paramNames, handler })
    },

    async fetch(request) {
      const url = new URL(request.url)
      const method = request.method.toUpperCase()
      const origin = request.headers.get('Origin') ?? ''
      const corsHeaders: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        Vary: 'Origin',
      }
      if (env.CORS_ORIGIN.includes(origin)) {
        corsHeaders['Access-Control-Allow-Origin'] = origin
      }

      // Handle CORS preflight
      if (method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders })
      }

      for (const route of routes) {
        if (route.method !== method) continue
        const match = url.pathname.match(route.pattern)
        if (!match) continue

        const params: Record<string, string> = {}
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1] ?? ''
        })

        const query = qs.parse(url.search, { ignoreQueryPrefix: true }) as Record<string, unknown>

        const body = ['GET', 'HEAD', 'DELETE'].includes(method)
          ? undefined
          : await request.json().catch(() => undefined)

        const headers: Record<string, string> = {}
        request.headers.forEach((value, key) => {
          headers[key] = value
        })

        try {
          const result = await route.handler({
            params,
            query,
            validatedQuery: {},
            body,
            headers,
            scope: container.createScope(),
          })

          return Response.json(result.json, { status: result.status, headers: corsHeaders })
        } catch (err) {
          const { status, json } = errorHandler(err, logger)
          return Response.json(json, { status, headers: corsHeaders })
        }
      }

      return Response.json({ error: 'Not Found' }, { status: 404, headers: corsHeaders })
    },
  }

  return app
}
