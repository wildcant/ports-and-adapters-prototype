# Auth Module Architecture

Visual companion to the [full MVP spec](./auth-module-mvp-spec.md). Read this first for the mental model, then dive into the spec for implementation details.

## System Overview

Three layers with strict boundaries. Repositories are private to the auth module's local container — only `AuthModuleService` is exposed to the shared container.

```mermaid
graph TB
  subgraph HTTP["HTTP Layer — api/auth/"]
    Register["POST .../register"]
    Authenticate["POST .../:actorType/:authProvider"]
    Refresh["POST .../token/refresh"]
  end

  subgraph Core["Core Auth Infrastructure — core/auth/"]
    AuthMW["authenticate()
    middleware factory"]
    ValidateScope["validateScopeProviderAssociation()"]
    GenToken["generateJwtTokenWithChecks()"]
    GenTokenDirect["generateJwtTokenForAuthIdentity()"]
    ValidateVerif["validateVerification()"]
    Config["authMethodsPerActor
    authVerificationsPerActor"]
  end

  subgraph Auth["Auth Module — modules/auth/"]
    AMS["AuthModuleService"]

    subgraph ProviderLayer["Provider Services"]
      APS["AuthProviderService
      resolves au_{id}"]
      VPS["VerificationProviderService
      resolves verif_{id}"]
    end

    subgraph Providers["Registered Providers"]
      EP["EmailpassProvider
      au_emailpass"]
      TV["TokenVerificationProvider
      verif_token"]
    end

    Proxy["AuthIdentityProviderService
    (per-call scoped proxy)"]

    subgraph Repos["Repositories — local container only"]
      AIR["AuthIdentityRepository"]
      PIR["ProviderIdentityRepository"]
      AVR["AuthVerificationRepository"]
      PRTR["AuthPasswordResetTokenRepository"]
    end
  end

  UserMod["User Module
  (linked via appMetadata)"]
  DB[("Postgres")]

  Register -->|"validateScopeProviderAssociation()"| ValidateScope
  Authenticate -->|"validateScopeProviderAssociation()"| ValidateScope
  Refresh -->|"authenticate('*', allowUnregistered)"| AuthMW

  Register & Authenticate & Refresh -->|"req.scope.resolve(Modules.AUTH)"| AMS

  Register -->|"actorless token"| GenTokenDirect
  Authenticate & Refresh -->|"gated token"| GenToken
  GenToken --> ValidateVerif
  ValidateVerif -->|"reads"| Config
  ValidateScope -->|"reads"| Config

  AMS -->|"register / authenticate / update"| APS
  AMS -->|"request / confirm verification"| VPS
  APS -->|"container.resolve('au_emailpass')"| EP
  VPS -->|"container.resolve('verif_token')"| TV

  AMS -->|"creates per call"| Proxy
  EP -->|"retrieve / create / update"| Proxy
  Proxy --> AIR & PIR
  TV -->|"AuthVerificationService"| AVR
  AMS --> PRTR

  AIR & PIR & AVR & PRTR --> DB
  AMS -.->|"appMetadata.userId"| UserMod

  style Repos fill:#f9f3e3,stroke:#d4a843
  style Providers fill:#e3f0f9,stroke:#4398d4
  style Proxy fill:#fce4ec,stroke:#c0392b
```

**Key boundaries:**

| Boundary | What crosses it | What doesn't |
|----------|----------------|--------------|
| Shared container | `AuthModuleService` | Repositories, providers, internal services |
| Provider API | `AuthIdentityProviderService` proxy (retrieve, create, update) | Repository instances, DB connection |
| Verification provider API | `AuthVerificationService` (list, create, update) | Direct repository access |

## Data Model

```mermaid
erDiagram
  auth_identity {
    text id PK "authid_..."
    jsonb appMetadata "links to actor via userId or customerId"
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt "soft-delete"
  }

  provider_identity {
    text id PK "provid_..."
    text authIdentityId FK
    text entityId "e.g. email address"
    text provider "e.g. emailpass"
    jsonb providerMetadata "e.g. scrypt password hash"
    jsonb userMetadata
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt "soft-delete"
  }

  auth_verification {
    text id PK "authver_..."
    text authIdentityId FK
    text entityId "e.g. email address"
    text entityType "e.g. email"
    text codeProvider "e.g. token"
    timestamptz verifiedAt "null means unverified"
    timestamptz requestedAt "used for TTL computation"
    jsonb providerMetadata "e.g. tokenHash"
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt "soft-delete"
  }

  auth_password_reset_token {
    text id PK "authprt_..."
    text authIdentityId FK
    text providerIdentityId FK
    text entityId "denormalized email"
    text tokenHash "SHA-256 hex digest"
    timestamptz expiresAt
    timestamptz createdAt
    timestamptz updatedAt
  }

  auth_identity ||--o{ provider_identity : "cascade delete"
  auth_identity ||--o{ auth_verification : "cascade delete"
  auth_identity ||--o{ auth_password_reset_token : "cascade delete"
  provider_identity ||--o{ auth_password_reset_token : "cascade delete"
```

| Convention | Details |
|------------|---------|
| ID prefixes | `authid_`, `provid_`, `authver_`, `authprt_` (SQL-generated, ADR 0003) |
| Soft-delete | `auth_identity`, `provider_identity`, `auth_verification` have `deletedAt`. BaseRepository auto-filters. |
| Hard-delete | `auth_password_reset_token` has no `deletedAt`. Transient security tokens are physically deleted on consumption. |
| Partial unique indexes | `provider_identity(entityId, provider) WHERE deletedAt IS NULL` — one active identity per email per provider |
| | `auth_verification(authIdentityId, entityId, entityType) WHERE deletedAt IS NULL` — one active verification per entity |

## Provider Routing

Auth providers never see repositories. They interact with identity data through a scoped proxy created fresh on every call.

```mermaid
flowchart LR
  Route["Route handler
  POST .../register"]

  Route -->|"authService.register('emailpass', data)"| AMS["AuthModuleService"]
  AMS -->|"1. Build scoped proxy"| Proxy["AuthIdentityProviderService
  closes over provider='emailpass'
  methods: retrieve, create, update"]
  AMS -->|"2. Delegate to provider service"| APS["AuthProviderService"]
  APS -->|"container.resolve('au_emailpass')"| EP["EmailpassProvider"]
  EP -->|"3. Provider calls proxy"| Proxy
  Proxy -->|"4. Proxy calls repos"| Repos["authIdentityRepository
  providerIdentityRepository"]
  Repos --> DB[("Postgres")]

  style Proxy fill:#fce4ec,stroke:#c0392b
```

**Why a proxy?** The `AuthIdentityProviderService` is an inline object (not a DI service) because each call needs a different `provider` scope. This is what makes auth providers extractable to standalone packages — they depend on the proxy interface, not on module internals.

## Request Flows

### Login (Happy Path — Admin User)

Admin users (`actorType: "user"`) have no verification requirement in the default config. Login returns a full JWT in one call.

```mermaid
sequenceDiagram
  participant C as Client
  participant MW as Middleware
  participant R as Route Handler
  participant AMS as AuthModuleService
  participant APS as AuthProviderService
  participant EP as EmailpassProvider
  participant GT as Token Generation

  C->>MW: POST /auth/user/emailpass<br/>{ email, password }
  MW->>MW: validateScopeProviderAssociation()
  Note over MW: authMethodsPerActor["user"]<br/>includes "emailpass" — pass

  MW->>R: validated request

  R->>AMS: authenticate("emailpass", { body })
  AMS->>APS: authenticate("emailpass", data, proxy)
  APS->>EP: authenticate(data, proxy)
  EP->>EP: proxy.retrieve({ entityId: email })
  EP->>EP: scrypt.verify(password, storedHash)
  EP-->>R: { success: true, authIdentity }

  R->>GT: generateJwtTokenWithChecks(authService, input, jwtConfig)
  GT->>GT: validateVerification()
  Note over GT: authVerificationsPerActor["user"]<br/>= undefined — no verification needed

  GT->>GT: generateJwtTokenForAuthIdentity()
  Note over GT: actorId = appMetadata.userId

  GT-->>R: { token }
  R-->>C: 200 { token: "full-jwt" }
```

### Invite-Based Admin Signup (3 HTTP Calls)

Registration produces an actorless JWT. The invite-accept workflow links the identity to a user. Token refresh picks up the link and returns a full JWT.

```mermaid
sequenceDiagram
  participant C as Client
  participant Auth as Auth Routes
  participant AMS as AuthModuleService
  participant EP as EmailpassProvider
  participant Admin as Invite Accept Route
  participant WF as acceptInviteWorkflow
  participant UM as User Module
  participant Ref as Token Refresh Route

  rect rgb(240, 248, 255)
  Note over C,EP: Step 1 — Register (actorless JWT)
  C->>Auth: POST /auth/user/emailpass/register<br/>{ email, password }
  Auth->>AMS: register("emailpass", data)
  AMS->>EP: register(data, proxy)
  EP->>EP: hash password with scrypt
  EP->>EP: proxy.create({ entityId, providerMetadata })
  EP-->>Auth: { success, authIdentity }
  Auth->>Auth: generateJwtTokenForAuthIdentity(actorless: true)
  Note over Auth: actorId = "" (no linked user)
  Auth-->>C: { token: "actorless-jwt" }
  end

  rect rgb(255, 248, 240)
  Note over C,UM: Step 2 — Accept Invite (link identity to user)
  C->>Admin: POST /admin/invites/accept<br/>Bearer: actorless-jwt
  Note over Admin: authenticate("user",<br/>{ allowUnregistered: true })
  Admin->>WF: run acceptInviteWorkflow
  WF->>UM: createUser() → usr_abc
  WF->>AMS: updateAuthIdentities([authIdentityId],<br/>{ appMetadata: { userId: "usr_abc" } })
  Admin-->>C: 200 OK
  end

  rect rgb(240, 255, 240)
  Note over C,AMS: Step 3 — Token Refresh (full JWT)
  C->>Ref: POST /auth/token/refresh<br/>Bearer: actorless-jwt
  Note over Ref: authenticate("*",<br/>{ allowUnregistered: true })
  Ref->>AMS: validateAuthIdentity(authIdentityId, provider)
  Ref->>Ref: generateJwtTokenWithChecks()
  Note over Ref: appMetadata.userId = "usr_abc"<br/>→ actorId = "usr_abc"
  Ref-->>C: { token: "full-jwt" }
  end
```

### Token Gating Decision Tree

How `generateJwtTokenWithChecks` decides between returning a full token or an actorless token with `verificationRequired: true`.

```mermaid
flowchart TD
  Start(["generateJwtTokenWithChecks() called"]) --> CheckConfig

  CheckConfig{"authVerificationsPerActor
  has entry for actorType?"}
  CheckConfig -->|No| FullToken
  CheckConfig -->|Yes| CheckProvider

  CheckProvider{"Entry matches
  authProvider?"}
  CheckProvider -->|No| FullToken
  CheckProvider -->|Yes| FindProv

  FindProv["Find providerIdentity
  matching authProvider"]
  FindProv --> QueryVerif

  QueryVerif["Query auth_verification
  (authIdentityId, entityId, entityType)"]
  QueryVerif --> IsVerified

  IsVerified{"verifiedAt
  is set?"}
  IsVerified -->|Yes| FullToken
  IsVerified -->|No record or null| Blocked

  Blocked["Return actorless token
  + verificationRequired: true"]

  FullToken["Generate full token"] --> ReadMeta

  ReadMeta{"appMetadata has
  {actorType}Id key?"}
  ReadMeta -->|"Yes (e.g. userId)"| HasActor["actorId = appMetadata.userId"]
  ReadMeta -->|No| NoActor["actorId = '' (still actorless)"]

  HasActor --> Sign["jwt.sign()"]
  NoActor --> Sign
  Blocked --> SignActorless["jwt.sign() with actorId = ''"]

  style Blocked fill:#fce4ec,stroke:#c0392b
  style FullToken fill:#e8f5e9,stroke:#2e7d32
  style Start fill:#e3f2fd,stroke:#1565c0
```

## Authenticate Middleware Decision Tree

How the `authenticate()` middleware factory resolves `req.authContext`.

```mermaid
flowchart TD
  Start(["Request arrives"]) --> Extract

  Extract["Extract Bearer token
  from Authorization header"] --> HasToken

  HasToken{"Token
  present?"}
  HasToken -->|No| AllowUnauth{"allowUnauthenticated?"}
  AllowUnauth -->|Yes| PassNoAuth["Pass through
  (no authContext)"]
  AllowUnauth -->|No| Reject401a["401 Unauthorized"]

  HasToken -->|Yes| Verify["jwt.verify()
  (ignoreExpiration: false)"]
  Verify --> Valid

  Valid{"Valid
  token?"}
  Valid -->|No| Reject401b["401 Invalid token"]
  Valid -->|Yes| CheckActorType

  CheckActorType{"actorType in
  permitted types?"}
  CheckActorType -->|No| Reject401c["401 Invalid actor type"]
  CheckActorType -->|Yes| CheckActorId

  CheckActorId{"actorId
  is set?"}
  CheckActorId -->|Yes| FullAuth["Pass with authContext
  (fully authenticated)"]
  CheckActorId -->|No| AllowUnreg{"allowUnregistered?"}
  AllowUnreg -->|Yes| ActorlessAuth["Pass with authContext
  (actorless session)"]
  AllowUnreg -->|No| Reject401d["401 Registration required"]

  style FullAuth fill:#e8f5e9,stroke:#2e7d32
  style ActorlessAuth fill:#fff3e0,stroke:#e65100
  style PassNoAuth fill:#f3e5f5,stroke:#6a1b9a
  style Reject401a fill:#fce4ec,stroke:#c0392b
  style Reject401b fill:#fce4ec,stroke:#c0392b
  style Reject401c fill:#fce4ec,stroke:#c0392b
  style Reject401d fill:#fce4ec,stroke:#c0392b
```

## Key Files

| Concept | File |
|---------|------|
| **Auth module definition** | `modules/auth/index.ts` |
| **AuthModuleService** | `modules/auth/services/auth-module-service.ts` |
| **AuthProviderService** | `modules/auth/services/auth-provider-service.ts` |
| **VerificationProviderService** | `modules/auth/services/verification-provider-service.ts` |
| **Provider loader** | `modules/auth/loaders/providers.ts` |
| **EmailpassProvider** | `providers/auth-emailpass/emailpass.ts` |
| **Models** | `modules/auth/models/auth-identity.ts`, `provider-identity.ts`, `auth-verification.ts`, `auth-password-reset-token.ts` |
| **authenticate() middleware** | `core/auth/middleware/authenticate.ts` |
| **generateJwtToken** | `core/auth/utils/token.ts` |
| **generateJwtTokenWithChecks** | `core/auth/utils/generate-jwt-token.ts` |
| **validateVerification** | `core/auth/utils/validate-verification.ts` |
| **validateScopeProviderAssociation** | `core/auth/utils/validate-scope-provider-association.ts` |
| **Auth config** | `core/auth/config.ts` |
| **AuthContext type** | `core/auth/types.ts` |
| **Route: register** | `api/auth/[actorType]/[authProvider]/register/route.ts` |
| **Route: authenticate** | `api/auth/[actorType]/[authProvider]/route.ts` |
| **Route: token refresh** | `api/auth/token/refresh/route.ts` |
| **Route middleware config** | `api/auth/middlewares.ts` |
| **HTTP schemas** | `packages/http-schemas/src/auth/` |

All paths relative to `apps/backend/src/`.

## What's Not Built Yet

These are defined in the spec but not yet implemented:

- **Password reset flow** — `POST .../reset-password` and `POST .../update` routes, `validateToken` middleware, `createPasswordResetToken` / `consumePasswordResetToken` service methods
- **Email verification flow** — `POST /auth/verification/request` and `POST /auth/verification/confirm` routes, token verification provider (`verif_token`)
- **Notification module integration** — Verification codes and reset JWTs are returned to the route handler but have no email delivery path yet
- **Customer self-signup flow** — `POST /store/customers` route with `createCustomerAccountWorkflow`
- **OAuth providers** — Architecture supports them, none ship with MVP

See the full spec's [Out of Scope](./auth-module-mvp-spec.md#out-of-scope) and [Email Delivery (TODO)](./auth-module-mvp-spec.md#email-delivery-todo-notification-module) sections.
