# 1. Per-Module Container Isolation

**Status:** Accepted

## Context

We need a DI strategy for a multi-module system. Options ranged from a single flat container (all services and repos registered together) to fully isolated per-module containers where only the public service is exposed.

Medusa uses a two-container approach: each module gets a private container for internals, and only the module service is registered in the shared container.

A flat container is simpler but leaks module internals — any code can resolve another module's repository directly, breaking encapsulation. It also makes module boundaries fuzzy and refactoring risky.

## Decision

Each module gets its own private Awilix container. The shared container only holds:
- Infrastructure singletons (pg pool, logger)
- Module public services (keyed by `Modules.XXX`)

The bootstrap process:
1. Creates a local container per module
2. Bridges shared deps (pg pool) into it
3. Creates a per-module Drizzle instance
4. Registers repositories in the local container
5. Instantiates the service with `localContainer.cradle`
6. Registers only the service in the shared container

```
shared container:
  "__pg_connection__"  →  postgres() client (pool)
  "customer"           →  CustomerModuleService (public API)
  "order"              →  OrderModuleService (public API)

order local container (private):
  "db"                 →  drizzle(client) instance
  "withTransaction"    →  transaction helper
  "orderRepository"    →  OrderRepository
```

## Consequences

- Modules cannot accidentally depend on another module's internals
- Swapping or removing a module only affects the shared container registration
- Slightly more wiring code in bootstrap vs a flat container
- Infrastructure deps must be explicitly bridged into local containers
- Testing a module in isolation is straightforward — mock the local container
