# Cross-Module Dependencies in DDD / Ports & Adapters

Research findings on handling circular and cross-cutting dependencies between modules in a hexagonal architecture TypeScript system using Awilix DI.

**Date:** 2026-07-17
**Context:** This project is a Ports & Adapters prototype with Awilix FP-style DI, currently containing a single `identity` module. The question is what happens when we add modules that need to reference each other.

---

## Table of Contents

1. [How DDD Resolves Cross-Module References](#1-how-ddd-resolves-cross-module-references)
2. [When Is an Event Bus Necessary vs Overkill?](#2-when-is-an-event-bus-necessary-vs-overkill)
3. [Is Awilix DI Enough?](#3-is-awilix-di-enough)
4. [Concrete Recommendations for This Project](#4-concrete-recommendations-for-this-project)

---

## 1. How DDD Resolves Cross-Module References

### 1.1 The Fundamental Rule: Aggregates Reference by ID

Evans (2003, Ch. 6) and Vernon (2013, Ch. 10) are both emphatic on this point: **aggregates in different bounded contexts (or even within the same context) should reference each other by identity (ID), not by direct object reference.**

> "Prefer references to external Aggregates using only their globally unique identity, not direct object references." -- Vaughn Vernon, *Implementing Domain-Driven Design* (2013), Chapter 10: Aggregates

Why this matters for this project: if an `Order` module needs to know which user placed the order, the `Order` aggregate should store a `userId: string`, not a `User` object. The `Order` module never imports `User` from the identity module's ports. It has its own concept of "who placed this order" represented as an ID.

This is the single most important rule for preventing circular dependencies. If Module A holds an ID pointing to Module B's aggregate, and Module B holds an ID pointing to Module A's aggregate, there is **no import-level dependency between them**. The circularity exists only in the data (foreign keys), not in the code.

### 1.2 Context Map Patterns

Evans (2003, Ch. 14) defines the Context Map as a document that describes the relationships between bounded contexts. The relevant patterns, ordered from tightest to loosest coupling:

#### Shared Kernel
Two contexts share a small, explicitly defined subset of the domain model. Both teams agree on the shared code, and changes require coordination.

**When to use:** Only when two modules are so tightly coupled that maintaining separate models creates more duplication than value. In a monolith with npm workspaces, a shared `@app/shared-kernel` package containing value objects (e.g., `EmailAddress`, `Money`, `UserId`) is a reasonable implementation.

**When to avoid:** When the modules are owned by different teams or evolve at different rates. The Shared Kernel creates a coupling bottleneck.

#### Customer/Supplier
One context (supplier/upstream) provides data or behavior that another (customer/downstream) consumes. The upstream team considers the downstream team's needs but owns the interface.

**When to use:** This is the most common pattern in a modular monolith. The identity module is an upstream supplier; other modules consume user IDs and perhaps user profile data. The supplier defines a stable public interface (the driving port), and the customer calls it.

**Implementation:** In this project, this already works naturally. If an `orders` module needs to verify a user exists, it depends on `IdentityService` (the driving port interface), not on the identity module's internals.

#### Anti-Corruption Layer (ACL)
The downstream context builds a translation layer that converts the upstream context's model into its own domain language. This prevents the upstream model from "leaking" into the downstream domain.

**When to use:** When the upstream module's model doesn't match what you need, or when you want maximum isolation. Vernon (2013, Ch. 13) recommends ACLs as the default integration pattern between bounded contexts.

**Implementation:** A thin adapter/translator service in the consuming module. For example, an `orders` module might define its own `OrderPlacer` type with only `{ id: string, name: string }` and have an ACL that maps from the identity module's `User` type to `OrderPlacer`.

#### Conformist
The downstream context simply adopts the upstream context's model as-is. No translation.

**When to use:** When the upstream model is close enough to what you need and the cost of translation exceeds the benefit. In a single-team monolith where you control both modules, this is often pragmatic.

**Implementation:** The downstream module directly imports types from the upstream module's `ports.ts`. This is the simplest approach but creates a compile-time coupling.

#### Open Host Service / Published Language
The upstream context exposes a well-defined protocol (API, events schema) designed for general consumption, not tailored to any specific downstream consumer.

**When to use:** When the upstream module has multiple consumers and needs a stable public contract. This is what the `IdentityService` driving port already is -- a Published Language for the identity domain.

#### Separate Ways
The contexts have no integration at all. Each solves its own problem independently, potentially duplicating some data or logic.

**When to use:** When the cost of integration exceeds the benefit, or when consistency between the contexts is not a business requirement.

### 1.3 The Role of Domain Events

Evans (2003) introduced domain events implicitly; Vernon (2013, Ch. 8) formalized them as a first-class DDD pattern.

> "Use Domain Events to achieve eventual consistency between Aggregates within a single Bounded Context and between Bounded Contexts." -- Vaughn Vernon, *Implementing Domain-Driven Design* (2013), Chapter 8

Domain events decouple the **temporal** and **directional** dependency between modules:

- **Without events:** Module A calls Module B synchronously. A depends on B. If B also needs to call A, you have a circular dependency.
- **With events:** Module A publishes a `UserCreated` event. Module B subscribes. Neither module imports the other. The event schema is the shared contract.

This is the DDD-prescribed solution for **true circular dependencies** -- when two modules each need to react to changes in the other.

---

## 2. When Is an Event Bus Necessary vs Overkill?

### 2.1 The Decision Framework

The decision is not binary. Here is a practical spectrum, from simplest to most complex:

#### Level 0: Direct Import of Port Interface (Conformist/Customer-Supplier)
```
OrderService depends on IdentityService (via port interface)
```

**Use when:**
- The dependency is one-directional (A needs B, but B does not need A).
- The call is synchronous and the caller needs the result immediately.
- Both modules are in the same process and deployment unit.
- You control both modules (single team).

**Trade-offs:**
- Simple, type-safe, debuggable.
- Creates a compile-time dependency from downstream to upstream ports.
- Perfectly fine for most modular monolith scenarios.

**This covers 80% of inter-module communication needs in a monolith.**

#### Level 1: Domain Events (In-Process, Synchronous)
```
IdentityService.createUser() -> publishes UserCreated
OrderModule's event handler reacts to UserCreated
```

**Use when:**
- The dependency is bidirectional (A and B both react to each other's changes).
- The upstream module should not know about downstream consumers ("fire and forget" semantics).
- You want to add new reactions to an event without modifying the publisher.
- Multiple modules need to react to the same state change.

**Trade-offs:**
- Decouples publisher from subscriber at the module level.
- Harder to trace execution flow (implicit control flow).
- Event schema becomes a shared contract that must be versioned.
- In-process synchronous events are still simple to reason about.

#### Level 2: Domain Events (Async, Eventually Consistent)
```
IdentityService.createUser() -> publishes UserCreated to a message bus
OrderModule eventually processes UserCreated
```

**Use when:**
- You need to cross process/service boundaries.
- The reaction can tolerate latency (eventual consistency is acceptable).
- The publisher must not be blocked by slow subscribers.
- You are moving toward microservices or need horizontal scaling.

**Trade-offs:**
- Introduces eventual consistency, which adds significant complexity.
- Requires infrastructure (message broker, dead letter queues, idempotency).
- Much harder to debug and test.
- **Almost never necessary in a modular monolith.** Vernon (2013) notes that even within a single bounded context, eventual consistency via async events is sometimes warranted, but it should not be the default.

### 2.2 The Litmus Test

Ask these questions in order:

1. **Is the dependency one-way?** If yes, use a direct service call (Level 0). Stop here.
2. **Does the publisher need to know about the subscriber?** If no, use events. If yes, use a direct call.
3. **Do multiple consumers react to the same change?** If yes, events are natural.
4. **Can the reaction be delayed?** If no, use synchronous events (Level 1). If yes, consider async (Level 2).
5. **Are you crossing deployment boundaries?** If yes, you need async events (Level 2).

### 2.3 The Circular Dependency Smell

When you find yourself wanting Module A to call Module B AND Module B to call Module A, pause and consider:

1. **Are they actually one module?** Sometimes circularity signals that the bounded context boundary is wrong. Consider merging them.
2. **Can one direction be inverted to events?** Usually one direction is a command ("do this") and the other is a reaction ("when X happens, do Y"). The reaction direction should be an event.
3. **Is there a missing third module?** Sometimes the circularity reveals a missing concept. An `Authorization` module that both `Identity` and `Orders` depend on, rather than them depending on each other.

Scott Millett and Nick Tune (*Patterns, Principles, and Practices of Domain-Driven Design*, 2015, Ch. 25) emphasize that discovering the right bounded context boundaries is an iterative process, and circular dependencies are a strong signal that boundaries need revisiting.

---

## 3. Is Awilix DI Enough?

### 3.1 What Awilix Gives You

Awilix is a DI container for Node.js/TypeScript that supports:

- **FP-style factories:** `asFunction(({ dep1, dep2 }) => createThing(dep1, dep2))` -- this is how the project uses it.
- **Lazy resolution:** Dependencies are resolved when first requested, not at registration time. This is critical for avoiding circular dependency issues.
- **Scoped containers:** `container.createScope()` creates a child container (used per-request in this project).
- **Singleton, scoped, and transient lifetimes.**

### 3.2 Awilix and Circular Dependencies: The Key Insight

Awilix resolves dependencies **lazily at resolution time**, not at registration time. This means:

```typescript
// Module A registers
container.register({
  orderService: asFunction(({ identityService }) => createOrderService(identityService)).singleton()
})

// Module B registers
container.register({
  identityService: asFunction(({ userRepository }) => createIdentityService(userRepository)).singleton()
})
```

The order of registration does not matter. When `orderService` is first resolved, Awilix resolves `identityService` on the fly. **There is no circular import at the TypeScript/ESM level** because each module's `index.ts` only imports `asFunction` from Awilix and its own local files. The dependency on `identityService` is resolved by name (string) at runtime, not by import at compile time.

This is the core architectural advantage of a DI container: **it breaks compile-time circular dependencies by deferring resolution to runtime.**

### 3.3 Where Awilix Handles Cross-Module Dependencies Well

**Scenario: One-way dependency (A depends on B)**

```typescript
// modules/orders/service.ts
import type { IdentityService } from "../identity/ports.js" // TYPE-ONLY import

type Dependencies = {
  identityService: IdentityService
}

export const createOrderService = ({ identityService }: Dependencies) => ({
  placeOrder: async (userId: string, items: Item[]) => {
    const user = await identityService.getUser(userId) // verify user exists
    // ... order logic
  }
})
```

This works perfectly with Awilix because:
- The `import type` creates no runtime dependency (it is erased by TypeScript).
- The actual `IdentityService` instance is injected by Awilix at resolution time.
- No circular import chain exists.

**Scenario: Two modules each depend on the other's port interface**

```typescript
// modules/identity/service.ts
import type { NotificationService } from "../notifications/ports.js"

type Dependencies = {
  userRepository: UserRepository
  notificationService: NotificationService
}

// modules/notifications/service.ts
import type { IdentityService } from "../identity/ports.js"

type Dependencies = {
  identityService: IdentityService
  emailAdapter: EmailAdapter
}
```

This also works with Awilix because:
- Both are `import type` (no runtime circular dependency in ESM).
- Awilix resolves both by name at runtime.
- However, there is a **runtime circular resolution risk**: if `identityService` resolution triggers `notificationService` resolution, which triggers `identityService` resolution, Awilix will throw a circular dependency error.

The fix: ensure the call chains don't actually recurse. If `createIdentityService` only stores a reference to `notificationService` and calls it later (not during construction), there is no problem. Awilix detects circularity during construction only.

### 3.4 Where Awilix Falls Short

**Limitation 1: Awilix cannot express "when X happens in Module A, do Y in Module B" without A knowing about B.**

If `IdentityService.createUser()` needs to trigger behavior in the `Notifications` module, someone has to make that call. With pure DI, the identity service must have `notificationService` in its dependency list, which means identity "knows about" notifications. This may violate the desired direction of dependency.

An event bus solves this by inverting the dependency: identity publishes an event, notifications subscribes. Identity has no reference to notifications at all.

**Limitation 2: Awilix has no built-in pub/sub or event mechanism.**

Awilix is a dependency injection container, not an application bus. It wires dependencies; it does not route messages. If you need pub/sub semantics, you need to build or adopt an event bus and register it into the container.

**Limitation 3: Awilix string-based resolution loses type safety.**

When route handlers resolve services via `req.scope.resolve<IdentityService>("identityService")`, the string `"identityService"` is unchecked. A typo fails at runtime, not compile time. Awilix offers a `cradle` proxy and TypeScript module augmentation to mitigate this, but it requires discipline.

### 3.5 A Simple In-Process Event Bus That Plugs Into Awilix

When you need events but don't need infrastructure, a simple synchronous event bus registered into Awilix is often sufficient:

```typescript
// shared/event-bus.ts
type EventHandler<T = any> = (event: T) => void | Promise<void>

type EventBus = {
  publish<T>(eventName: string, event: T): Promise<void>
  subscribe<T>(eventName: string, handler: EventHandler<T>): void
}

const createEventBus = (): EventBus => {
  const handlers = new Map<string, EventHandler[]>()

  return {
    async publish(eventName, event) {
      const eventHandlers = handlers.get(eventName) ?? []
      await Promise.all(eventHandlers.map(h => h(event)))
    },
    subscribe(eventName, handler) {
      const existing = handlers.get(eventName) ?? []
      handlers.set(eventName, [...existing, handler])
    }
  }
}
```

Register it as a singleton in the container:
```typescript
container.register({
  eventBus: asFunction(createEventBus).singleton()
})
```

Modules subscribe during their registration phase:
```typescript
export function registerNotificationsModule(container: AwilixContainer) {
  container.register({
    notificationService: asFunction(createNotificationService).singleton()
  })

  // Subscribe to events from other modules
  const eventBus = container.resolve<EventBus>("eventBus")
  const notifications = container.resolve<NotificationService>("notificationService")
  eventBus.subscribe("user.created", (event) => {
    notifications.sendWelcomeEmail(event.userId)
  })
}
```

This gives you decoupled modules without any infrastructure beyond what Awilix already provides.

### 3.6 Mediator Pattern as an Alternative

The Mediator pattern (as popularized by MediatR in .NET) is another option. Instead of services calling each other directly, they send commands/queries through a mediator that routes them to the appropriate handler. This is essentially a more structured form of the event bus pattern, with explicit request/response semantics.

For a TypeScript project, libraries like `tinybus` or a hand-rolled mediator serve this purpose. However, for a modular monolith at the scale described in this project, a mediator adds ceremony without proportional benefit. A simple event bus or direct DI-based service calls are preferable until the number of cross-module interactions justifies the indirection.

---

## 4. Concrete Recommendations for This Project

Given the project's current architecture (Awilix FP-style DI, single `identity` module, ports & adapters structure), here are ranked recommendations for handling cross-module dependencies as new modules are added.

### 4.1 Start With the Simplest Thing: Direct Port Dependencies via Awilix

For the first few modules you add (e.g., `orders`, `billing`, `notifications`), use direct dependencies through port interfaces:

```
modules/
  identity/
    ports.ts          # defines IdentityService, UserRepository
    service.ts         # depends on UserRepository
    index.ts           # registers into container
  orders/
    ports.ts           # defines OrderService, OrderRepository
    service.ts         # depends on OrderRepository AND IdentityService (via type import)
    index.ts           # registers into container
```

**Rules:**
1. **Reference other modules' aggregates by ID only.** The `Order` type has `userId: string`, never `user: User`.
2. **Depend on port interfaces, never on services or adapters directly.** Use `import type { IdentityService } from "../identity/ports.js"`.
3. **Keep dependency direction consistent.** Draw a dependency graph. Arrows should generally point in one direction (downstream depends on upstream). If you see a cycle, that's a design signal.
4. **Register modules in dependency order in `container.ts`.** While Awilix handles lazy resolution, explicit ordering documents the architecture:

```typescript
const container = createContainer()
registerIdentityModule(container)    // upstream (no dependencies on other modules)
registerOrdersModule(container)      // downstream (depends on identity)
registerNotificationsModule(container) // downstream (depends on identity, orders)
```

### 4.2 Introduce Events Only When You Hit a Real Pain Point

Do not pre-build an event bus. Wait until one of these happens:

- **A module needs to react to another module's state changes without the publisher knowing about the subscriber.** Example: Identity should not know that Notifications sends a welcome email when a user is created.
- **Multiple modules react to the same state change.** Example: When a user is created, Notifications sends email, Analytics logs the event, and Billing creates a free-tier account.
- **You have a genuine circular dependency** that cannot be resolved by re-drawing module boundaries or extracting a third module.

When that happens, add the simple in-process event bus described in Section 3.5. Register it in the container. Have publishers inject `eventBus` and call `publish()`. Have subscribers wire up in their module's `registerXxxModule()` function.

### 4.3 Strengthen Type Safety at the Container Boundary

The current pattern of `req.scope.resolve<IdentityService>("identityService")` is functional but fragile. As the number of modules grows, consider defining a typed cradle interface:

```typescript
// container-types.ts
import type { IdentityService } from "./modules/identity/ports.js"
import type { OrderService } from "./modules/orders/ports.js"

export interface AppCradle {
  identityService: IdentityService
  orderService: OrderService
  // ... all registered services
}
```

Then use Awilix's generic parameter:

```typescript
import type { AwilixContainer } from "awilix"
import type { AppCradle } from "./container-types.js"

const container = createContainer<AppCradle>()
```

This gives you compile-time checking when resolving from the container, and serves as living documentation of all registered services.

### 4.4 Module Boundary Checklist

Before adding a new module, answer these questions:

| Question | Answer drives... |
|---|---|
| Does this module own its own aggregate(s)? | If no, it might be part of an existing module |
| Does it have its own persistence (table/collection)? | Validates it's a distinct bounded context |
| Which existing modules does it depend on? | Determines registration order and dependency direction |
| Do any existing modules need to react to its changes? | If yes, plan for events |
| Do any existing modules need to call into it? | If yes, ensure it exposes a driving port |
| Does adding it create a dependency cycle? | If yes, consider events, a mediator, or redrawing boundaries |

### 4.5 What NOT To Do

1. **Do not create a shared "models" package that all modules import from.** This is a Shared Kernel anti-pattern when applied broadly. Each module should own its domain types. Share only true value objects (like `EmailAddress` or `Money`) if absolutely necessary.

2. **Do not pass entity objects across module boundaries.** Pass IDs or DTOs. If `OrderService.placeOrder()` needs user info, it should call `identityService.getUser(userId)` and extract only what it needs, or better yet, only accept `userId: string` and let the caller verify the user exists.

3. **Do not use Awilix's `build()` to construct ad-hoc objects with injected dependencies.** Stick to the factory pattern (`asFunction`) for all module services. This keeps the dependency graph explicit and traceable.

4. **Do not reach for an async message broker (RabbitMQ, Kafka, etc.) in a modular monolith.** This is an infrastructure decision that should be driven by deployment topology, not by code organization. If everything runs in one process, synchronous in-process events are sufficient and vastly simpler.

---

## Summary Table

| Scenario | Pattern | Mechanism |
|---|---|---|
| A needs data from B (one-way) | Customer/Supplier | Direct DI: A's service injects B's port interface |
| A reacts to B's state changes (one-way, B unaware) | Domain Events | In-process event bus registered in Awilix |
| A and B both need each other | Redesign first | Extract third module, or make one direction event-based |
| A wants B's types but translated | Anti-Corruption Layer | Adapter in A that maps B's types to A's domain language |
| Shared value objects (Email, Money) | Shared Kernel | Small shared package, explicitly owned and versioned |
| Cross-service boundary | Open Host Service | HTTP/gRPC API with Published Language (schema) |

---

## Sources

- Evans, Eric. *Domain-Driven Design: Tackling Complexity in the Heart of Software.* Addison-Wesley, 2003. (Chapters 6, 14, and the DDD Reference summary at domainlanguage.com)
- Vernon, Vaughn. *Implementing Domain-Driven Design.* Addison-Wesley, 2013. (Chapters 8, 10, 13)
- Cockburn, Alistair. "Hexagonal Architecture." alistair.cockburn.us/hexagonal-architecture/, 2005.
- Millett, Scott and Tune, Nick. *Patterns, Principles, and Practices of Domain-Driven Design.* Wrox, 2015. (Chapter 25)
- Awilix GitHub repository and documentation. github.com/jeffijoe/awilix
- Medusa.js source code and architecture (github.com/medusajs/medusa) -- for practical examples of module-based DI with Awilix in a commerce platform.
