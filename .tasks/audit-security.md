# Security Audit: OpenWav Merch Connect

**Date:** 2026-06-30
**Scope:** Security, secrets exposure, RLS policies, and multi-tenant data isolation

---

## CRITICAL Findings

### C-1: Hardcoded Magic Link Endpoint with Weak Static Token

**File:** `src/routes/api/public/temp-magic.tsx`, lines 1-24

A publicly accessible endpoint generates magic authentication links for a hardcoded email (`leann+testrun@openwav.ai`) using only a static string token (`openwav-demo-capture-2026`) as its sole authentication. Anyone who discovers this URL can generate a valid login link and gain full authenticated access to the target account.

```typescript
// Line 9
if (token !== 'openwav-demo-capture-2026') {
  return new Response('forbidden', { status: 403 });
}
// Line 13
const { data, error } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email: 'leann+testrun@openwav.ai',
});
```

**Fix:** Delete this file entirely. It is a debug/demo artifact that must never exist in production.

### C-2: Supabase Anon Key Committed to Git History (Permanent)

**File:** Originally `.env` (committed in `475711e`, removed in `c58b9f0`)

The initial commit committed `.env` containing the Supabase anon/publishable JWT. While it was subsequently removed and `.env` was added to `.gitignore`, the key remains in the git history permanently.

This is an anon key (not service role), so the blast radius is limited since RLS protects data. The same key is also hardcoded in `vite.config.ts` (line 13-14) which is intentional for client-side usage. **No service role key was found in git history.**

**Fix:** This is acceptable for anon keys (which are public by design in Supabase). No rotation needed, but scrub the git history if the repo is ever made public.

### C-3: Client-Side Direct Database Queries Bypass Server-Side Auth

**Files:** Multiple admin routes query Supabase directly from the browser:
- `src/routes/_authenticated/_admin/admin.products_.$id.tsx` -- Lines 311, 359, 611, 632, 647, 653-654, 660, 750, 758, 776, 856, 876, 878, 894
- `src/routes/_authenticated/_admin/admin.products.tsx` -- Lines 262, 276, 292
- `src/routes/_authenticated/_admin/admin.index.tsx` -- Lines 17-21
- `src/routes/signup.tsx` -- Line 89

These routes import the browser Supabase client and execute `.insert()`, `.update()`, `.delete()`, `.select()` calls directly. While RLS provides some protection, this means:

1. **Any authenticated admin** can craft arbitrary queries from devtools. The admin RLS policies use `has_role(auth.uid(), 'admin')` which returns true for all admins -- there is no fine-grained permission model.
2. **Product mutations** (insert, update, delete) on `products`, `product_images`, `print_zones` tables go through the browser client, relying entirely on RLS.

**Fix:** Move all write operations to `createServerFn` handlers with `requireSupabaseAuth` middleware and use `supabaseAdmin` with explicit authorization checks.

---

## HIGH Findings

### H-1: SQL Injection via Unsanitized ilike in Admin Search

**File:** `src/lib/admin-impersonation.functions.ts`, line 55

```typescript
q = q.or(`name.ilike.%${trimmed}%,slug.ilike.%${trimmed}%`);
```

User input (`trimmed`) is interpolated directly into a PostgREST filter string. Special characters like `%`, `_`, and `,` can alter query behavior. A search term containing `,` could inject additional filter clauses.

**Fix:**
```typescript
// Before
q = q.or(`name.ilike.%${trimmed}%,slug.ilike.%${trimmed}%`);

// After - escape PostgREST special characters
const escaped = trimmed.replace(/[%_\\]/g, c => '\\' + c);
q = q.ilike('name', `%${escaped}%`);
```

### H-2: Shopify Access Tokens Readable via RLS Despite Column-Level Revoke

**File:** `supabase/migrations/20260513230827_8e18db46-8409-448e-a497-18db1a8f3b0b.sql`

The `shopify_stores` table stores `access_token` and `webhook_secret`. While SELECT on these columns was revoked from `authenticated`, the table still has INSERT, UPDATE, DELETE grants to `authenticated`:

```sql
GRANT INSERT, UPDATE, DELETE ON public.shopify_stores TO authenticated;
```

An org admin could UPDATE the `access_token` column to a value they control, effectively hijacking the Shopify store integration.

**Fix:** Revoke INSERT/UPDATE/DELETE on `shopify_stores` from `authenticated`. All writes should go through `supabaseAdmin` in server functions only.

### H-3: Freshdesk Webhook Uses Non-Timing-Safe String Comparison

**File:** `src/routes/api/public/freshdesk/webhook.tsx`, line 42

```typescript
if (!expected || secret !== expected) {
```

Vulnerable to timing attacks. An attacker could progressively determine the secret character-by-character.

**Fix:** Use timing-safe comparison:
```typescript
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
```

### H-4: Gelato Stock Refresh Cron Uses Non-Timing-Safe String Comparison

**File:** `src/routes/api/public/cron/gelato-stock-refresh.ts`, line 18

```typescript
if (!expected || auth !== `Bearer ${expected}`) {
```

Same timing attack vulnerability as H-3.

### H-5: Admin Route Guard is Client-Side Only

**File:** `src/routes/_authenticated/_admin.tsx`, lines 15-19

```typescript
useEffect(() => {
  if (!loading && !hasRole("admin")) {
    navigate({ to: "/dashboard" });
  }
}, [loading, hasRole, navigate]);
```

The admin route guard is purely a client-side React `useEffect` redirect. There is no server-side middleware that prevents non-admin users from accessing admin routes. Admin page components are shipped to all authenticated users.

**Fix:** Add a `beforeLoad` server-side check on the `_admin` route that validates the user's role before rendering.

---

## MEDIUM Findings

### M-1: Mockups Storage Bucket Has Overly Permissive Public Read

**File:** `supabase/migrations/20260501192402_af5086bc-6a46-47da-a8cf-c310fefa10d0.sql`, lines 34-36

```sql
CREATE POLICY "Public read mockups"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'mockups');
```

The `mockups` bucket is readable by anonymous users. This may be intentional (mockups need to be embeddable in Shopify products), but all organization mockups are publicly discoverable.

### M-2: styled-thumbnails Bucket Has Public Read Without Authentication

**File:** `supabase/migrations/20260519190955_3d0c5c58-96bb-4f6b-b9b9-2a8da2fa7861.sql`, lines 14-16

```sql
CREATE POLICY "Public read styled-thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'styled-thumbnails');
```

No `TO` clause means this grants to ALL roles including `anon`.

### M-3: design-submissions Bucket Write Policy Uses org_role Not org_admin

**File:** `supabase/migrations/20260527164652_1132eba3-7a31-4057-9a04-2ed6413fdf8f.sql`, lines 28-38

The write policy allows any user with `designer` role to upload. The path convention `{organization_id}/{design_id}/{...}` combined with `has_org_role` check means this is correctly scoped to the designer's own org.

### M-4: RLS Helper Functions Execute Privilege Structure

The `has_role`, `has_org_role`, and `current_user_orgs` functions were properly hardened:
- **SECURITY DEFINER** with `SET search_path = public` -- CORRECT
- Execute revoked from PUBLIC and anon -- CORRECT
- Re-granted to authenticated only -- CORRECT

This is well done.

### M-5: Missing Write RLS Policies on Several Tables

The following tables have RLS enabled but lack explicit INSERT/UPDATE/DELETE policies for non-admin operations. All writes via service role only. **Intentional -- no fix needed.**

- `daily_billing_runs` -- Only SELECT for admins
- `shopify_webhook_events` -- Only SELECT for admins
- `audit_logs` -- Only SELECT policy, immutable by design

### M-6: Org Member Role Escalation Vector on organization_members

**File:** `supabase/migrations/20260422063247_58c7c4da-dec9-432d-92d6-e7c0902ec904.sql`, lines 130-135

The UPDATE policy on `organization_members` allows org admins to update roles:
```sql
CREATE POLICY "Admins+ update member roles"
  ON public.organization_members FOR UPDATE TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, 'admin')
    OR public.has_role(auth.uid(), 'admin')
  );
```

An org admin could promote themselves to `owner` since there is no check preventing role escalation.

**Fix:** Add a WITH CHECK constraint:
```sql
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'admin')
  AND (NEW.role != 'owner' OR public.has_org_role(auth.uid(), organization_id, 'owner'))
)
```

### M-7: Impersonation Validation Does Not Check Target Org Membership

**File:** `src/server/org-context.ts`, lines 28-35

When an ops team member impersonates an org, `resolveEffectiveOrgId` only checks the caller has an ops role and the target org exists. Any ops team member can access any organization's data. The audit trail provides accountability.

---

## LOW Findings

### L-1: Supabase URL and Publishable Key Hardcoded in vite.config.ts

**File:** `vite.config.ts`, lines 12-15

These are publishable/anon keys, so exposure is by design. However, hardcoding in source control means the key cannot be rotated without a code change and redeploy.

### L-2: dangerouslySetInnerHTML Usage in chart.tsx

**File:** `src/components/ui/chart.tsx`, line 73

Used to inject CSS variables for chart theming. Content is from developer-controlled config, not user input. **Low risk.**

### L-3: Server-Side Token Validation is Properly Implemented

**File:** `src/integrations/supabase/auth-middleware.ts`

The `requireSupabaseAuth` middleware correctly:
1. Extracts the Bearer token from the Authorization header
2. Validates it via `supabase.auth.getClaims(token)`
3. Extracts `sub` (user ID) from claims
4. Passes `userId` to the handler context

**Correctly implemented.**

### L-4: Webhook Authentication Is Generally Sound

All webhook endpoints implement authentication:
- **Gelato:** `X-Gelato-Auth` header with timing-safe comparison
- **Shopify (per-store):** URL-embedded secret compared timing-safe against DB
- **Master Shopify:** HMAC-SHA256 verification
- **PopFulfill:** HMAC-SHA256 verification via `HTTP-X-FACTORY-SIGNATURE`
- **Freshdesk:** Query-string secret (non-timing-safe -- see H-3)
- **All cron endpoints:** Bearer token against `CRON_SECRET`

### L-5: No .env File Currently in Repository

The `.gitignore` properly includes `.env` and `.dev.vars`. No `.env` file currently exists in the working tree or tracked files.

### L-6: Server-Only Modules Cannot Leak to Client Bundle

Server modules read secrets from `process.env` (not `import.meta.env.VITE_*`). The `createServerFn` RPC model ensures these modules are only loaded server-side. **No evidence of server-only imports in client components.**

---

## Summary of Security Posture

**Overall assessment: GOOD with notable gaps to address before production.**

**Strengths:**
1. Auth middleware chain validates JWTs server-side with claim extraction
2. RLS is enabled on ALL tables (60+ tables verified)
3. Multi-tenant isolation via `has_org_role()` and `current_user_orgs()` SECURITY DEFINER functions with proper search_path pinning
4. Sensitive columns have column-level REVOKE grants
5. SECURITY DEFINER functions have EXECUTE revoked from PUBLIC/anon
6. Most webhook endpoints use timing-safe secret comparison
7. Server secrets are in `.dev.vars` / Cloudflare secrets, not in source control
8. Impersonation system validates ops team role server-side

**Critical gaps to close:**
1. **Delete `temp-magic.tsx` immediately** -- allows unauthenticated magic link generation
2. **Move admin product writes to server functions** -- client-side Supabase mutations bypass server-side auth middleware
3. **Sanitize PostgREST filter interpolation** in admin search
4. **Apply timing-safe comparison** to Freshdesk webhook and gelato-stock-refresh cron
5. **Revoke write grants** on `shopify_stores` from authenticated role
