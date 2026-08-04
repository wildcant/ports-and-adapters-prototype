# Backend

Standalone API server built with Ports & Adapters architecture, Drizzle ORM, and Awilix DI. See the root [CLAUDE.md](../../CLAUDE.md) for full architecture overview.

## Date Handling

Dates flow through three layers, each with a single canonical representation:

| Layer | Type | Example |
|-------|------|---------|
| Database | `timestamp with time zone` | `2026-08-03 12:00:00+00` |
| Application (services, DTOs, repositories) | `Date` | `new Date()` |
| API (JSON responses) | ISO 8601 string | `"2026-08-03T12:00:00.000Z"` |

### Database columns

All timestamp columns use Drizzle's built-in `timestamp({ withTimezone: true })`, which returns native `Date` objects. The shared `timestamps` helper in `src/core/db/columns.ts` defines `createdAt`, `updatedAt`, and `deletedAt` for every table:

```ts
import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  deletedAt: timestamp({ withTimezone: true }),
}
```

Event-specific timestamps (e.g. `capturedAt`, `shippedAt`) use `timestamp({ withTimezone: true })` directly. Drizzle's `casing: 'snake_case'` config handles the camelCase-to-snake_case mapping automatically, so explicit column names are unnecessary.

### Application layer

Services and repositories work exclusively with `Date` objects. Never call `.toISOString()` in application code — the API layer handles serialization.

### API layer — the `dateToIso` pipeline

The `dateToIso` Zod pipeline in `packages/http-schemas/src/common.ts` converts `Date` to an ISO string during response serialization:

```ts
export const dateToIso = z
  .date()
  .transform((d) => d.toISOString())
  .pipe(z.iso.datetime({ offset: true }))
```

Entity schemas use `dateToIso` for individual date fields and spread `...timestamps.shape` for the standard trio:

```ts
export const AdminUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  ...timestamps.shape, // createdAt, updatedAt, deletedAt
})
```

