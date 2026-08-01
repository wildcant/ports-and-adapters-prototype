# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps, run Drizzle migrations)
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

# Regenerate OpenAPI specs + Orval clients (admin & frontend)
npm run openapi:generate

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

- **Standalone API** (`apps/backend/src/index.ts`): Creates container → creates App (zero-dep fetch router) → loads file-based routes → serves via Node.js
- **Backend-as-library** (`apps/backend/src/container.ts`): Exports the container for direct use by `apps/frontend/src/server/users.ts` via TanStack Start `createServerFn` — no HTTP round-trip

### HTTP layer

- **Route handlers** (`apps/backend/src/api/`) use file-based routing (Next.js-style `[id]` params). They export named HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) and receive `HttpRequest` / return `HttpResult` — framework-agnostic types defined in `apps/backend/src/server/ports.ts`.
- **App** (`apps/backend/src/server/app.ts`) is a zero-dependency router that compiles route patterns to regexes and produces a Web Standard `fetch(Request) -> Response` handler.
- **Platform runners** (`apps/backend/src/server/platforms.ts`) are thin adapters that plug the App's fetch handler into Node.js, Express, Vercel, Lambda, Cloudflare Workers, Bun, or Deno.

### DI convention

All factories use Awilix FP-style: `const createThing = ({ dep1, dep2 }: Dependencies): Thing => ...`. Registered with `asFunction(...).singleton()`. Route handlers resolve services from `req.scope` (a scoped container created per request).

### Database

Drizzle schemas live in each module's `models/` directory (e.g. `src/modules/user/models/`, `src/modules/customer/models/`). Each module has its own `drizzle.config.ts` and colocated migrations.

### Frontend

TanStack Start (React 19, Vite, TanStack Router). Uses `#/*` import alias for `./src/*`. The `/users` page calls `createServerFn` handlers that resolve services from the shared backend container.

## Coding Style

- Use simple, direct variable names. No unnecessary suffixes like `Result`, `Data`, `Value`, `Info`. Name variables for what they represent, not their type or origin.
- Prefer guard clauses over nested conditionals. Check unusual conditions early and return, keeping the happy path linear and unindented. See `docs/refactoring/replace_nested_conditional_with_guard_clauses.txt`.
- Comments should explain *why*, not *what*. Don't restate the code — document the intent, business reason, or non-obvious constraint.
- For best-effort async calls, use `.catch((e) => this.logger.error(e))` instead of wrapping in try/catch with an empty or comment-only catch block.
- Use `Promise.all` with `.map()` instead of `for` loops with `await` inside when iterations are independent.
- Use `type` instead of `interface`. Interfaces allow declaration merging on name overlap, which can cause subtle bugs. Composable `type` aliases with `&` intersections are safer and more predictable.
