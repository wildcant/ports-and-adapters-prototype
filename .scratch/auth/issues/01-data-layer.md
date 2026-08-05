# 01 — Auth module data layer (models + repositories + empty service shell)

**What to build:** The four auth tables exist in Postgres with migrations, repositories are wired, and `AuthModuleService` is registered in the shared container as an empty shell. Running `db:migrate:dev` creates the tables. The module follows the same pattern as user/payment.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `Modules.AUTH` added to `modules-definition.ts`
- [ ] `auth_identity` table: prefixed ID (`authid_`), `app_metadata` (jsonb, nullable), soft-delete via `timestamps`
- [ ] `auth_identity` cascades deletes to all child tables: `auth_identity.cascades({ delete: ["provider_identity", "auth_verification", "auth_password_reset_token"] })`
- [ ] `provider_identity` cascades deletes to its child table: `provider_identity.cascades({ delete: ["auth_password_reset_token"] })`
- [ ] `provider_identity` table: prefixed ID (`provid_`), FK to `auth_identity`, `entity_id` (text), `provider` (text), `provider_metadata` (jsonb, nullable), `user_metadata` (jsonb, nullable), soft-delete via `timestamps`, unique index on `(entity_id, provider)` where `deleted_at IS NULL`
- [ ] `auth_verification` table: prefixed ID (`authver_`), FK to `auth_identity`, `entity_id`, `entity_type`, `code_provider`, `verified_at` (nullable), `requested_at`, `provider_metadata` (jsonb, nullable), soft-delete via `timestamps`, unique index on `(auth_identity_id, entity_id, entity_type)` where `deleted_at IS NULL`
- [ ] `auth_password_reset_token` table: prefixed ID (`authprt_`), FKs to `auth_identity` and `provider_identity`, `entity_id`, `token_hash`, `expires_at`, `created_at`/`updated_at` only (no `deleted_at` — hard-delete table), indexes on `provider_identity_id` and `token_hash`
- [ ] `AuthIdentityRepository`, `ProviderIdentityRepository`, `AuthVerificationRepository` extend `BaseRepository`
- [ ] `AuthPasswordResetTokenRepository` is a custom class (not BaseRepository) with `create`, `findByTokenHash`, `deleteByProviderIdentityId`, `hardDelete`
- [ ] Core types added in `core/types/auth/`: DTOs for all four entities, mutation types, stub service interface (`IAuthModuleService`)
- [ ] `AuthModuleService` class implements the stub interface (methods can throw "not implemented" for now)
- [ ] Module wired via `Module(Modules.AUTH, { service, repositories })` and registered in `container.ts`
- [ ] Drizzle migration config at `modules/auth/database.config.ts`
- [ ] Migrations generated and runnable
- [ ] Repository integration tests: CRUD on all four tables, unique constraint violations on `provider_identity` and `auth_verification`, hard-delete behavior on `auth_password_reset_token`
