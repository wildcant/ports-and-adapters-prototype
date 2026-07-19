# 7. Zero-Dependency Web Standard Router

**Status:** Accepted

## Context

The HTTP layer needs a router to dispatch requests to route handlers. Options:

- **Express/Fastify:** Battle-tested, huge middleware ecosystem, but locks you into Node.js and adds dependency weight.
- **Hono:** Web Standard compatible, lightweight, runs everywhere. Still a dependency with its own API surface.
- **Custom minimal router:** Zero dependencies, compiles path patterns to regexes, produces a `fetch(Request) → Response` handler that runs on any Web Standard platform.

The architecture already decouples route handlers from the HTTP framework via `HttpRequest`/`HttpResult` types. The router is just glue between the platform and the handlers.

## Decision

A custom zero-dependency router (~80 lines) that:
1. Compiles route patterns (`:id` params) to regexes at registration time
2. Exposes `addRoute(method, path, handler)` and `fetch(request): Response`
3. Parses JSON bodies, extracts path params, creates a scoped container per request
4. Delegates to route handlers that return `{ status, json }`

Platform adapters (Node.js `http.createServer`, Bun `serve`, etc.) are thin wrappers over the `fetch` handler.

## Consequences

- Runs everywhere: Node.js, Bun, Deno, Cloudflare Workers, Vercel, Lambda — no framework lock-in
- Zero dependency risk (no supply chain, no breaking upgrades)
- Route handlers are pure functions: `HttpRequest → HttpResult` — trivially testable without supertest
- No middleware ecosystem — cross-cutting concerns (auth, logging, CORS) must be implemented manually
- No built-in validation, rate limiting, or other framework niceties
- Adding features like streaming responses or WebSocket support requires manual implementation
