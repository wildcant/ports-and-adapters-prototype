/**
 * Adapter that lets `createServerFn` call route handlers directly.
 *
 * Builds a fake HttpRequest (scoped container, params, query, body) and
 * feeds it to the handler, returning only the JSON payload. The handlers
 * imported from `api/index.ts` already have middleware applied, so
 * validation and query parsing happen automatically.
 */

import { container } from '../container.js'

type RouteHandler = (req: never) => Promise<{ status: number; json: unknown }>

/** Extracts the `json` return type from a route handler. */
type ExtractJson<H> = H extends (req: never) => Promise<{ json: infer J }> ? J : never

/** Maps `createServerFn` validator data into params/query/body for the handler. */
type RequestMapping = (data: Record<string, never>) => {
  params?: Record<string, string>
  query?: Record<string, string | string[]>
  body?: unknown
}

export const apiCall =
  <H extends RouteHandler>(handler: H, map?: RequestMapping) =>
  async (args?: { data?: unknown }): Promise<ExtractJson<H>> => {
    const mapped = map ? map(args?.data as never) : { body: args?.data }
    const result = await handler({
      scope: container.createScope(),
      params: mapped.params ?? {},
      query: mapped.query ?? {},
      body: mapped.body,
    } as never)
    return result.json as ExtractJson<H>
  }
