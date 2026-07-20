# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps, run Drizzle migrations, generate Prisma client)
npm run setup

# Start standalone backend API (http://localhost:3000)
npm run --workspace=backend start

# Start frontend dev server (http://localhost:3001)
npm run --workspace=frontend dev

# Type-check backend
npm run --workspace=backend typecheck

# Run frontend tests
npm run --workspace=frontend test

# Drizzle: generate migration after schema change
npm run --workspace=backend db:generate

# Drizzle: run migrations
npm run --workspace=backend db:migrate

# Prisma: regenerate client after schema change
npx prisma generate --schema=backend/prisma/schema.prisma
```

## Architecture

This is a **Ports & Adapters (Hexagonal Architecture)** prototype using npm workspaces (`backend`, `frontend`). It demonstrates swappable ORM adapters, HTTP frameworks, and platform runners — all wired through Awilix DI.

### Core pattern

Every module follows the same layered structure:

1. **Ports** (`src/modules/<name>/ports.ts`) — Pure TypeScript interfaces. Domain types, service interface (driving/inbound), repository interface (driven/outbound). No imports from frameworks or ORMs.
2. **Service** (`src/modules/<name>/service.ts`) — Business logic. Depends only on port interfaces. Receives dependencies via Awilix factory injection (`({ userRepository }) => ...`).
3. **Adapters** (`src/modules/<name>/adapters/<orm>/`) — Concrete implementations of driven ports (e.g., Drizzle or Prisma repository). Each adapter folder re-exports `createDb` and `createUserRepository` from an `index.ts`.
4. **Module wiring** (`src/modules/<name>/index.ts`) — Composition root. Registers factories into the Awilix container. **Swap adapters by changing one import path** (drizzle vs prisma).

### Two entry points for the same business logic

- **Standalone API** (`backend/src/index.ts`): Creates container → creates App (zero-dep fetch router) → loads file-based routes → serves via Node.js
- **Backend-as-library** (`backend/src/container.ts`): Exports the container for direct use by `frontend/src/server/users.ts` via TanStack Start `createServerFn` — no HTTP round-trip

### HTTP layer

- **Route handlers** (`backend/src/api/`) use file-based routing (Next.js-style `[id]` params). They export named HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) and receive `HttpRequest` / return `HttpResult` — framework-agnostic types defined in `backend/src/server/ports.ts`.
- **App** (`backend/src/server/app.ts`) is a zero-dependency router that compiles route patterns to regexes and produces a Web Standard `fetch(Request) -> Response` handler.
- **Platform runners** (`backend/src/server/platforms.ts`) are thin adapters that plug the App's fetch handler into Node.js, Express, Vercel, Lambda, Cloudflare Workers, Bun, or Deno.

### DI convention

All factories use Awilix FP-style: `const createThing = ({ dep1, dep2 }: Dependencies): Thing => ...`. Registered with `asFunction(...).singleton()`. Route handlers resolve services from `req.scope` (a scoped container created per request).

### Database

Drizzle schemas live in each module's `models/` directory (e.g. `src/modules/user/models/`, `src/modules/customer/models/`). Each module has its own `drizzle.config.ts` and colocated migrations.

### Frontend

TanStack Start (React 19, Vite, TanStack Router). Uses `#/*` import alias for `./src/*`. The `/users` page calls `createServerFn` handlers that resolve services from the shared backend container.
