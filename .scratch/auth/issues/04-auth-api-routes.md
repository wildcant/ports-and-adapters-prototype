# 04 — Auth API routes (register + login + token refresh)

**What to build:** End-to-end registration and login over HTTP. Three routes: `POST /auth/:actor_type/:auth_provider/register` returns an actorless JWT, `POST /auth/:actor_type/:auth_provider` returns a full JWT (or actorless if no linked actor), `POST /auth/token/refresh` re-signs with fresh `app_metadata`. Auth config gates which providers each actor type can use.

**Blocked by:** 02 — Emailpass provider, 03 — JWT + middleware

**Status:** ready-for-agent

- [ ] `authMethodsPerActor` config in `core/auth/config.ts` — controls which auth providers each actor type can use
- [ ] `authVerificationsPerActor` config in `core/auth/config.ts` — controls which actor types require verification (consumed by ticket 06, declared here for `generateJwtTokenWithChecks`)
- [ ] `validateScopeProviderAssociation()` middleware in `core/auth/utils/validate-scope-provider-association.ts` — reads `:actor_type` and `:auth_provider` from params, checks against `authMethodsPerActor`, throws if provider not allowed
- [ ] `generateJwtTokenForAuthIdentity` in `core/auth/utils/generate-jwt-token.ts` — builds JWT payload from auth identity, populates `actor_id` from `app_metadata[{actorType}_id]` (or empty string if absent)
- [ ] `validateVerification()` utility in `core/auth/utils/validate-verification.ts` — reads `authVerificationsPerActor` config, finds matching provider identity, queries `auth_verification` record, returns `{ verification_required, verification }` or passes. Extracted as a standalone testable function, called by `generateJwtTokenWithChecks`
- [ ] `generateJwtTokenWithChecks` in `core/auth/utils/generate-jwt-token.ts` — generates actorless token first, calls `validateVerification()` for verification gates, returns full token if no blockers
- [ ] `POST /auth/:actor_type/:auth_provider/register` route: calls `authModule.register()`, returns actorless JWT
- [ ] `POST /auth/:actor_type/:auth_provider` route: calls `authModule.authenticate()`, runs `generateJwtTokenWithChecks`, returns `{ token }` or `{ token, verification_required }`
- [ ] `POST /auth/token/refresh` route: Branch 1 (actor_id set) re-signs with fresh data; Branch 2 (actorless) re-runs `validateAuthIdentity` + `generateJwtTokenWithChecks`
- [ ] `AuthModuleService.validateAuthIdentity(id, provider)` implemented — thin wrapper for token refresh Branch 2
- [ ] Auth route middleware map: each route declares its own `middlewares[]` per spec (refresh needs `authenticate("*", { allowUnregistered: true })`, register/login need `validateScopeProviderAssociation()`)
- [ ] HTTP schemas in `packages/http-schemas` for all three endpoints (request bodies, response shapes)
- [ ] Tests: register returns actorless JWT, login with linked actor returns full JWT, login without linked actor returns actorless JWT, token refresh picks up `app_metadata` changes, disallowed provider rejected by scope validation
