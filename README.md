# Ports & Adapters Prototype

A minimal prototype exploring **Ports & Adapters** (Hexagonal Architecture) with **Awilix DI**, **file-based routing**, and **swappable adapters** — inspired by [Medusa](https://github.com/medusajs/medusa).

## What this demonstrates

- **Ports & Adapters architecture** — business logic depends only on interfaces (ports), never on frameworks or ORMs
- **Dependency Injection with Awilix** — FP-style factories (`asFunction`) wired into a container
- **File-based routing** — filesystem structure defines the route table (like Next.js, Medusa, etc.)
- **Swappable ORM adapters** — swap Drizzle for Prisma by changing one import path
- **Swappable HTTP frameworks** — zero-dep router, Express, or Hono — same route handlers
- **Swappable platform runners** — Node.js, Vercel, Lambda, Cloudflare Workers, Bun, Deno
- **Backend as a library** — TanStack Start server functions call the service layer directly via the shared container, no HTTP round-trip

## Project structure

```
├── backend/
│   └── src/
│       ├── index.ts                      # Composition root (standalone API server)
│       ├── container.ts                  # Shared container (importable as a library)
│       ├── routes-loader.ts              # File-based route discovery
│       ├── server/
│       │   ├── ports.ts                  # App + HttpRequest/HttpResult interfaces
│       │   ├── app.ts                    # Zero-dependency fetch-based router
│       │   └── platforms.ts              # Node.js, Express, Vercel, Lambda, etc.
│       ├── api/
│       │   ├── users/
│       │   │   ├── route.ts              # GET /users, POST /users
│       │   │   └── [id]/route.ts         # GET/PATCH/DELETE /users/:id
│       │   └── customers/
│       │       ├── route.ts              # GET /customers, POST /customers
│       │       ├── [id]/route.ts         # GET/PATCH/DELETE /customers/:id
│       │       └── middlewares.ts         # Validation + OpenAPI metadata
│       └── modules/
│           ├── user/
│           │   ├── models/               # Drizzle table definitions
│           │   ├── repositories/         # Database access
│           │   ├── services/             # Business logic
│           │   └── index.ts              # Module wiring
│           └── customer/
│               ├── models/               # Drizzle table definitions
│               ├── repositories/         # Database access
│               ├── services/             # Business logic
│               └── index.ts              # Module wiring
├── frontend/                             # TanStack Start (SSR React)
│   └── src/
│       ├── server/users.ts               # Server functions using backend container
│       └── routes/users.tsx              # Users page (no HTTP fetch needed)
└── package.json                          # npm workspaces root
```

## Setup

```bash
npm run setup
```

This installs dependencies, runs Drizzle migrations (creates the SQLite DB), and generates the Prisma client.

## Running

**Option A — Standalone backend API:**

```bash
npm run --workspace=backend start
# API at http://localhost:3000
```

**Option B — Full stack with TanStack Start:**

```bash
# Terminal 1
npm run --workspace=backend start

# Terminal 2
npm run --workspace=frontend dev
# Frontend at http://localhost:3001
```

**Option C — Frontend only (no backend server needed):**

```bash
npm run --workspace=frontend dev
# The /users page calls the backend service directly via createServerFn
```

## Swapping adapters

### Swap ORM (Drizzle -> Prisma)

Change one import in a module's `index.ts`:

```diff
-import { createDb, createUserRepository } from "./adapters/drizzle/index.js"
+import { createDb, createUserRepository } from "./adapters/prisma/index.js"
```

The service, routes, and frontend all keep working unchanged.

### Swap HTTP framework

The route handlers in `api/` are framework-agnostic — they use `HttpRequest`/`HttpResult`, not Express `req`/`res`. The `App` port exposes a Web Standard `fetch(Request) -> Response` interface.

See `backend/src/server/platforms.ts` for examples of plugging the same `App` into Node.js, Express, Vercel, Lambda, Cloudflare Workers, Bun, or Deno.

## Key concepts

### Ports & Adapters

```
                    ┌─────────────────────────────────┐
  HTTP Request ───> │  Route Handler (driving adapter) │
                    │         │                        │
                    │         v                        │
                    │  UserService (port)              │
                    │         │                        │
                    │         v                        │
                    │  UserRepository (port)            │
                    │         │                        │
                    └─────────│────────────────────────┘
                              v
                    ┌─────────────────────┐
                    │  Drizzle / Prisma    │  <- driven adapter (swappable)
                    │  (implements repo)   │
                    └─────────────────────┘
```

### Backend as a library

The same business logic runs in two contexts without any code changes:

```
Standalone API:    Request -> fetch router -> container -> service -> DB
TanStack Start:    createServerFn -> container -> service -> DB
```

The service layer doesn't know or care which entry point called it.

## TODO

- [x] Add a Supabase adapter to the user module (alongside Drizzle and Prisma)
- [ ] Investigate how to handle circular dependencies between modules — how does DDD suggest resolving cross-module references? When is the event bus necessary? is awilix enough for my usecase? atomic workflow when data mutation happen across multiple modules, how to rollback on failure?.
- [ ] Deploy the app and backend to different infrastructure targets:
  - [ ] Serverless: Cloudflare Workers, AWS Lambda
  - [ ] Server-based: regular VPS on AWS
- [ ] Explore TanStack's different approaches to building and rendering (SPA vs SSR)
- [ ] Atomic operations, how write transactions with drizzle.