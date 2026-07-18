# 02 — Rename identity to user module

**What to build:** The existing identity module restructured into the new architecture pattern. The module is renamed to `user`, its service becomes a class-based `UserModuleService` with constructor injection, its repository extends `BaseRepository`, and it uses the `Module()` factory for registration. The Drizzle/Prisma/Supabase adapter-swapping demo is dropped (original code preserved on `prototype-reference` branch). The user module uses only the Supabase/Postgres adapter going forward, matching all other modules. API routes under `/identity` are renamed to `/user` (or removed if out of scope for this phase).

**Blocked by:** 01 — Core infrastructure + Customer module

**Status:** ready-for-agent

- [ ] `modules/identity/` renamed to `modules/user/`
- [ ] Adapter directories (drizzle, prisma, supabase) removed — single Postgres implementation using BaseRepository
- [ ] `UserModuleService` is class-based with constructor injection and `InjectedDependencies` type
- [ ] `UserRepository` extends `BaseRepository`
- [ ] `modules/user/index.ts` uses `Module(Modules.USER, { service, repositories, models })`
- [ ] `core/types/user/` has `common.ts`, `mutations.ts`, `service.ts`
- [ ] User model has SQL-level prefixed ID (`user_` prefix) and `deleted_at` column
- [ ] `modules/user/drizzle.config.ts` configured for per-module migrations
- [ ] `container.resolve(Modules.USER)` returns a working `UserModuleService`
- [ ] Existing API routes updated to resolve from `Modules.USER` instead of `"identityService"`
