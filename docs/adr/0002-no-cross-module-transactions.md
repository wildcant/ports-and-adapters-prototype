# 2. No Cross-Module Transactions

**Status:** Accepted

## Context

When a workflow touches multiple modules (e.g., creating an order debits inventory and creates a payment record), the question is whether those operations share a database transaction.

Medusa deliberately prevents cross-module transactions. Each module owns its transactional boundary. Cross-module consistency is achieved via workflow compensation (sagas).

Sharing transactions across modules would couple their internals (same connection, same Drizzle instance, awareness of each other's schemas). It also makes horizontal scaling and future service extraction impossible.

## Decision

Each module manages its own transactions via an injected `withTransaction` helper. Modules cannot share a transaction — even if they use the same underlying Postgres instance.

Within a module, transaction propagation works via `context.transaction`:
- If a transaction already exists on the context, reuse it (short-circuit)
- Otherwise, start a new one and propagate it down

Cross-module consistency will be handled by saga/compensation patterns in workflows (deferred — not yet implemented).

## Consequences

- True module independence — modules can be extracted to separate services later
- Workflows must handle partial failure (module A succeeded, module B failed)
- Slightly more complex error handling at the orchestration layer
- No risk of long-running transactions spanning unrelated operations
- Each module's `withTransaction` is simple and self-contained
