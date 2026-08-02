# @proteus/utils

Platform-agnostic utility functions shared across all Proteus apps and packages.

## Goal

Provide a single home for pure, generic utilities that have no dependency on any
specific runtime (browser, Node, Workers) or framework (React, Hono, etc.). If a
helper is useful to more than one app and doesn't belong to a domain-specific
package, it belongs here.

## Structure

Utilities are organized by domain, one file per domain:

| File       | Domain | Examples                    |
| ---------- | ------ | --------------------------- |
| `date.ts`  | Date   | `todayIso`, `daysAgoIso`    |

New domains (money, number, distance, etc.) should be added as separate files
and re-exported from `index.ts`.

## Usage

```ts
import { todayIso, daysAgoIso } from '@proteus/utils'
```

## Guidelines

- **No runtime-specific APIs.** Everything must work in browsers, Node, and
  Cloudflare Workers.
- **No framework dependencies.** No React, no Hono, no Express.
- **Tree-shakeable.** Use named exports only — no default exports or barrel
  re-exports of entire libraries.
- **Start lean.** Only add utilities when a real consumer needs them.
