# 06 — Email verification (token provider + request/confirm routes)

**What to build:** Actor types configured in `authVerificationsPerActor` (e.g., customer) get `verification_required` at login instead of a full token. They can request a verification code and confirm it. After confirmation, login returns a full JWT. The token verification provider generates cryptographically secure tokens, stores only SHA-256 hashes, and supports token rotation on re-request.

**Blocked by:** 04 — Auth API routes

**Status:** ready-for-agent

- [ ] `IAuthVerificationProvider` interface with `request(data, sharedContext?)` and `confirm(data, sharedContext?)` methods
- [ ] Token verification provider (`verif_token`) implements `IAuthVerificationProvider`: generates 32-byte random token via `crypto.randomBytes`, SHA-256 hashes it, upserts `auth_verification` record (create if new, update if re-requested — rotates token)
- [ ] `request` returns record + plaintext `code` + `expires_at` (plaintext for forwarding to notification module, never in API response)
- [ ] `confirm` hashes submitted code, looks up by hash, validates not-already-verified, validates code_provider match, validates expiry (`requested_at + TTL`), stamps `verified_at`
- [ ] TTL default 900 seconds (15 minutes), configurable via provider options
- [ ] `VerificationProviderService` resolves `verif_{providerId}` from local container, routes `request` and `confirm` calls
- [ ] Module loader registers `verif_token` in the local container
- [ ] `AuthModuleService.requestAuthVerification(data)` and `confirmAuthVerification(data)` delegate to `VerificationProviderService`
- [ ] `POST /auth/verification/request` route: bearer auth (actorless), generates token, logs plaintext in dev (TODO: notification module), returns record without code
- [ ] `POST /auth/verification/confirm` route: public or bearer auth, submits code, marks verified
- [ ] `generateJwtTokenWithChecks` verification gate now functional: queries `auth_verification` for the identity, returns `verification_required` when unverified
- [ ] Verification utility functions in `modules/auth/utils/verification-token.ts`
- [ ] HTTP schemas for both endpoints
- [ ] Tests: request generates token, confirm with correct code succeeds, confirm with wrong code fails, re-request invalidates old code, expired code rejected, already-verified entity can't be re-confirmed, login gated until verified, login returns full JWT after verification
