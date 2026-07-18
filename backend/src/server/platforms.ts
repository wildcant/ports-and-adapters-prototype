/**
 * PLATFORM RUNNERS -- Plug an App into a specific runtime.
 * Each is a thin adapter from app.fetch to the platform's entry point.
 */

import type { App } from './ports.js'

// ---- Node.js (local dev, traditional servers) ----

export async function serveNode(app: App, port: number, callback?: () => void) {
  // Node 18+ has built-in fetch, but no built-in way to serve it.
  // Use @hono/node-server which accepts any fetch handler.
  const { serve } = await import('@hono/node-server')
  serve({ fetch: app.fetch, port }, callback)
}

// ---- Express (existing apps, legacy integrations) ----

export async function serveExpress(app: App, port: number, callback?: () => void) {
  const express = (await import('express')).default
  const { Readable } = await import('node:stream')
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

    const response = await app.fetch(request)
    const body = await response.json()
    res.status(response.status).json(body)
  })

  server.listen(port, callback)
}

// ---- Vercel Serverless / Edge ----
//
// // app/api/[...path]/route.ts (or api/index.ts)
// import { app } from "../../bootstrap.js"
//
// export const GET  = app.fetch
// export const POST = app.fetch
// // ... etc
//
// That's it. Vercel calls your exported function with a Web Standard Request.

// ---- AWS Lambda ----
//
// // handler.ts
// import { app } from "./bootstrap.js"
//
// export const handler = awslambda.streamifyResponse(
//   async (event, responseStream, context) => {
//     // Use a Lambda-to-fetch adapter like @hono/aws-lambda
//     const { handle } = await import("@hono/aws-lambda")
//     return handle({ fetch: app.fetch })(event, context)
//   }
// )
//
// Or with the simpler API Gateway v2 format:
//
// import { APIGatewayProxyHandlerV2 } from "aws-lambda"
//
// export const handler: APIGatewayProxyHandlerV2 = async (event) => {
//   const url = `https://${event.requestContext.domainName}${event.rawPath}`
//   const request = new Request(url, {
//     method: event.requestContext.http.method,
//     headers: event.headers as Record<string, string>,
//     body: event.body,
//   })
//   const response = await app.fetch(request)
//   return {
//     statusCode: response.status,
//     headers: Object.fromEntries(response.headers),
//     body: await response.text(),
//   }
// }

// ---- Cloudflare Workers ----
//
// // src/index.ts
// import { app } from "./bootstrap.js"
//
// export default { fetch: app.fetch }
//
// Done. Workers natively use the fetch API.

// ---- Bun ----
//
// import { app } from "./bootstrap.js"
//
// Bun.serve({ fetch: app.fetch, port: 3000 })

// ---- Deno ----
//
// import { app } from "./bootstrap.js"
//
// Deno.serve({ port: 3000 }, app.fetch)

// ---- TanStack Start (full-stack React on Cloudflare Workers, Vercel, etc.) ----
//
// Compose your API alongside TanStack Start's React SSR.
// Split at the fetch level: /api/* -> your app, /* -> TanStack Start.
//
// // src/server.ts (custom server entry)
// import handler, { createServerEntry } from "@tanstack/react-start/server-entry"
// import { app } from "./bootstrap.js"
//
// export default createServerEntry({
//   async fetch(request) {
//     const url = new URL(request.url)
//
//     // API routes -> your app
//     if (url.pathname.startsWith("/api/")) {
//       return app.fetch(request)
//     }
//
//     // Everything else -> TanStack Start (React SSR)
//     return handler.fetch(request)
//   },
// })
