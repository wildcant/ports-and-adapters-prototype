# 02 — Emailpass auth provider (register + authenticate)

**What to build:** A user can register with email+password and authenticate at the service level. The emailpass provider hashes passwords with scrypt, creates/retrieves identities via the `AuthIdentityProviderService` proxy, and strips `provider_metadata.password` from all responses. Claimable identities (empty `app_metadata`) are supported for the invite flow. No JWT or HTTP routes yet — this ticket tests at the service layer.

**Blocked by:** 01 — Auth module data layer

**Status:** ready-for-agent

- [ ] `AbstractAuthModuleProvider` base class with `register`, `authenticate`, `update`, `validateCallback` methods (default implementations throw "not supported")
- [ ] Emailpass provider extends `AbstractAuthModuleProvider`, implements `register` and `authenticate`
- [ ] `register`: validates email + password present, checks for existing identity, supports claimable identities (existing identity with empty `app_metadata` gets updated instead of rejected), hashes password with scrypt, creates via proxy
- [ ] `authenticate`: validates email + password present, retrieves identity via proxy, verifies password hash with scrypt constant-time comparison
- [ ] `update`: hashes new password, merges into existing `provider_metadata` via proxy
- [ ] All methods strip `provider_metadata.password` from returned DTOs before returning
- [ ] Scrypt config defaults (`logN: 15, r: 8, p: 1`), configurable via provider options
- [ ] `AuthProviderService` resolves `au_{providerId}` from the local container, routes `register`, `authenticate`, `update` calls
- [ ] `AuthIdentityProviderService` proxy: plain object created per-call by `AuthModuleService`, scoped to a `provider` string, with `retrieve`, `create`, `update` methods that use internal repos
- [ ] `AuthModuleService.register(provider, authData)` and `authenticate(provider, authData)` delegate to `AuthProviderService`
- [ ] `AuthModuleOptions` type defined: `providers[]` array (auth providers with `resolve`, `id`, `options`) and `verification.providers[]` array (verification providers) — public configuration surface of the auth module
- [ ] Module loader registers `au_emailpass` in the local container (follows payment provider loader pattern), reads from `AuthModuleOptions.providers`
- [ ] `scrypt-kdf` and password utility wrappers in `modules/auth/utils/`
- [ ] Tests: register creates auth_identity + provider_identity, authenticate succeeds with correct password, authenticate fails with wrong password, duplicate email rejected, claimable identity claimed with new password, password hash never in returned data
