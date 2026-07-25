/**
 * HTTP SERVER PORT -- Framework-agnostic interfaces.
 *
 * Two levels of abstraction:
 *
 * 1. App -- register routes, get a fetch handler. Universal.
 * 2. Platform runners -- serveNode(), Vercel export, Lambda handler, etc.
 *    These are one-liners that plug an App into a specific runtime.
 */

import type { AwilixContainer } from 'awilix'

// ---- Route handler types (used by api/ route files) ----

export type HttpRequest<
  T extends {
    body?: unknown
    params?: Record<string, string>
    query?: Record<string, unknown>
  } = object,
> = {
  params: T extends { params: infer P } ? P : Record<string, string>
  query: Record<string, string | string[]>
  validatedQuery: T extends { query: infer Q } ? Q : Record<string, unknown>
  body: T extends { body: infer B } ? B : unknown
  scope: AwilixContainer
}

export type HttpResult = {
  status: number
  json: unknown
}

export type RouteHandler = (req: HttpRequest) => Promise<HttpResult>

// ---- App port (framework-agnostic) ----

export type App = {
  addRoute(method: string, path: string, handler: RouteHandler): void
  fetch(request: Request): Promise<Response>
}

export type CreateApp = (opts: { container: AwilixContainer }) => App
