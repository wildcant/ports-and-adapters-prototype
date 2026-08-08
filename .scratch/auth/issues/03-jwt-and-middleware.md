# 03 — JWT infrastructure + authenticate middleware

**What to build:** The system can sign JWTs, verify bearer tokens, and protect routes. `JWT_SECRET` is validated at startup via Zod. The `authenticate()` middleware factory populates `req.authContext`. Namespace defaults are applied by the route loader: admin routes require auth, store routes allow optional auth, auth routes have no global auth. The `MiddlewareRoute` type gains an optional `middlewares[]` array for per-route pre-handler logic.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `JWT_SECRET` (required string), `JWT_PUBLIC_KEY` (optional, default `''`), `JWT_EXPIRES_IN` (default `'1d'`) added to `env.ts` Zod schema — startup fails if `JWT_SECRET` is missing
- [x] `generateJwtToken(payload, jwtConfig)` utility in `core/auth/utils/token.ts` — single `jwt.sign()` wrapper, throws if secret or expiresIn missing
- [x] `getAuthContextFromJwtToken(authHeader, actorTypes)` in `core/auth/middleware/authenticate.ts` — single `jwt.verify()` callsite, prototype pollution defense (own-property `ignoreExpiration: false`, `ignoreNotBefore: false`), returns `AuthContext | null`
- [x] `AuthContext` type in `core/auth/types.ts`: `actorId`, `actorType`, `authIdentityId`, `authProvider`, `appMetadata`, `userMetadata` (camelCase per project convention)
- [x] `ActorType` union type (`"user" | "customer"`) in `core/auth/types.ts`
- [x] `MiddlewareFunction` type: `(req: HttpRequest) => HttpRequest | Promise<HttpRequest>` — throws `AppError` to short-circuit
- [x] `MiddlewareRoute` type extended with optional `middlewares?: MiddlewareFunction[]`
- [x] `applyMiddleware` updated to run `middlewares[]` in order before param/query/body validation
- [x] `authenticate(actorType, options?)` factory returns `MiddlewareFunction` — supports `allowUnauthenticated` and `allowUnregistered` options, decision tree per spec
- [x] `HttpRequest` type gains optional `authContext?: AuthContext` field
- [x] `routes-loader.ts` applies namespace defaults: `/admin/**` gets `authenticate("user")`, `/store/**` gets `authenticate("customer", { allowUnauthenticated: true })`, `/auth/**` gets nothing
- [x] When a route's `middlewares[]` includes an `authenticate()` call, it replaces the namespace default (no double-run)
- [x] `jsonwebtoken` and `@types/jsonwebtoken` added as dependencies
- [x] Tests: valid token → `authContext` populated, expired token → 401, missing token on protected route → 401, wrong actor type → 401, actorless token (`actorId: ""`) blocked on regular admin routes, actorless token allowed with `allowUnregistered: true`, missing token allowed with `allowUnauthenticated: true`, `JWT_PUBLIC_KEY` used for verification when set
