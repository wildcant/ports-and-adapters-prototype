# 07 — Password reset (reset token generation + update route)

**What to build:** A user can request a password reset, receive a purpose-bound reset JWT (logged in dev), and use it to set a new password. The reset token is single-use (DB record hard-deleted on consumption), prior tokens are invalidated on new request, and the endpoint always returns 201 regardless of whether the email exists (no enumeration).

**Blocked by:** 04 — Auth API routes

**Status:** ready-for-agent

- [ ] `AuthModuleService.createPasswordResetToken({ provider, entity_id, ttl_seconds })` — generates UUID jti via `crypto.randomUUID()`, SHA-256 hashes it, invalidates prior tokens for the same provider identity, persists `auth_password_reset_token` record
- [ ] `AuthModuleService.consumePasswordResetToken({ jti, provider, entity_id })` — hash-based lookup, expiry check, provider + entity_id cross-check against DB record, atomic hard-deletion (single-use enforcement)
- [ ] Reset JWT payload: `{ entity_id, provider, actor_type, purpose: "reset" }`, signed with `jti` claim, hardcoded 15-minute TTL (`RESET_PASSWORD_TOKEN_TTL_SECONDS = 15 * 60`)
- [ ] `validateToken()` middleware in `core/auth/utils/validate-token.ts`: extracts JWT from Authorization header, guards `purpose !== "reset"` or missing `jti`, calls `consumePasswordResetToken`, fetches provider identity, populates `req.auth_context` with entity_id from validated token (not from request body)
- [ ] `POST /auth/:actor_type/:auth_provider/reset-password` route: looks up provider identity, generates reset token + reset JWT, logs JWT in dev (TODO: notification module), always returns 201
- [ ] `POST /auth/:actor_type/:auth_provider/update` route: `validateToken` middleware consumes DB token, then `authModule.updateProvider()` delegates to emailpass provider which hashes the new password
- [ ] `AuthModuleService.updateProvider(provider, data)` delegates to `AuthProviderService.update()`
- [ ] HTTP schemas for both endpoints
- [ ] Tests: request reset creates token + JWT, consume token succeeds on first use, consume token fails on second use (single-use), expired token rejected, regular JWT rejected at update endpoint (no `purpose: "reset"`), prior tokens invalidated on new request, reset-password always returns 201 even for nonexistent email, password updated successfully, login with new password succeeds
- [ ] Update `scripts/simulate-checkout.sh` to incorporate auth: register a user, login to get a JWT, pass `Authorization: Bearer <token>` on all admin/store requests that now require auth (end-to-end smoke test of the full auth + checkout flow via curl)
