# 05 — Identity-to-actor linking (`setAuthAppMetadataStep`)

**What to build:** The reusable workflow step that links an auth identity to an actor entity by writing `{actorType}_id` into `app_metadata`. This is the primitive that `acceptInviteWorkflow` (admin users, user module) and `createCustomerAccountWorkflow` (storefront, customer module) will compose. Those domain-specific workflows live in their respective modules, not here. After this step runs and the client calls token refresh, the JWT gains a populated `actor_id`.

**Blocked by:** 04 — Auth API routes

**Status:** ready-for-agent

- [ ] `AuthModuleService.retrieveAuthIdentity(id)` implemented — returns auth identity with `app_metadata`
- [ ] `AuthModuleService.updateAuthIdentities(data)` implemented — updates `app_metadata` on auth identities
- [ ] `setAuthAppMetadataStep` workflow step in `workflows/auth/steps/`: constructs key `{actorType}_id`, guards against overwriting (throws if key already exists and new value is non-null), writes `app_metadata[key] = actorId`
- [ ] Compensation function: restores old `app_metadata` value on rollback (or deletes key if it didn't exist before)
- [ ] Tests: step writes `user_id` into `app_metadata`, step throws on overwrite attempt, compensation restores previous state, token refresh after step returns full JWT with `actor_id` populated
