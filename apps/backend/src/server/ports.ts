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
import type { AuthContext } from '../core/auth/types.js'

// ---- Route handler types (used by api/ route files) ----

type ZodSchema = { _zod: { output: unknown; input: unknown } }
type InferField<T> = T extends ZodSchema ? T['_zod']['output'] : T
type InferResponse<T> = T extends ZodSchema ? T['_zod']['input'] : T

// Mirrors the runtime restructuring in applyMiddleware: raw query fields
// are split into { pagination, filters } before reaching the handler.
type InferQuery<T> = T extends ZodSchema
  ? {
      pagination: {
        offset: number
        limit: number
        order?: Record<string, 'ASC' | 'DESC'>
      }
      filters: Omit<T['_zod']['output'], 'offset' | 'limit' | 'order' | 'q'>
    }
  : T

export type HttpRequest<T = object> = {
  params: T extends { params: infer P } ? InferField<P> : Record<string, string>
  query: Record<string, unknown>
  validatedQuery: T extends { query: infer Q } ? InferQuery<Q> : Record<string, unknown>
  body: T extends { body: infer B } ? InferField<B> : unknown
  scope: AwilixContainer
  headers: Record<string, string>
  authContext?: AuthContext
}

export type HttpResult<T = unknown> = {
  status: number
  json: InferResponse<T>
}

export type RouteHandler = <T>(req: HttpRequest) => Promise<HttpResult<T>>

// ---- App port (framework-agnostic) ----

export type App = {
  addRoute(method: string, path: string, handler: RouteHandler): void
  fetch(request: Request): Promise<Response>
}

export type CreateApp = (opts: { container: AwilixContainer }) => App
