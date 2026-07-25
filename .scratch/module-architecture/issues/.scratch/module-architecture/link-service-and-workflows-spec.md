# 08 — Link Service Registry and Workflow Infrastructure

**Supersedes:** 07 — Link modules (retains link definitions and migrations from 07; replaces the service pattern and adds workflows)

**Status:** ready-for-agent

---

## Problem Statement

The current link-modules implementation bundles cross-module orchestration logic into a `LinkModuleService` that acts as both a CRUD service for the link table and a cross-module query orchestrator. The `getInventoryAvailability()` method is business orchestration disguised as a service method — it joins across the link table and the inventory module's `inventory_level` table in a single query, making the service responsible for concerns that belong to a higher-level composition layer.

Meanwhile, the prototype has no workflow infrastructure. The `GET /store/carts/:id/inventory` route handler contains 55 lines of orchestration logic that resolves multiple services, fetches data from different modules, and assembles a cross-module result. This logic cannot be reused from other entry points (e.g., cart completion, order creation) and has no compensation or rollback capability.

The codebase needs two things: (1) a link service pattern that cleanly separates link-table CRUD from cross-module orchestration, and (2) a workflow layer where that orchestration lives.

## Solution

Replace `LinkModuleService` with a `LinkService` that acts as a **typed repository registry**. Each link (writable or readonly) gets its own repository. The service provides a single `repo(name)` method that returns the correctly-typed repository for that link. Generic CRUD comes from `BaseRepository` (writable links) or custom read-only query methods (readonly links). Performance-critical cross-module JOINs live as escape-hatch methods on the specific repository — not on the service itself.

Introduce a workflow layer using the `defineWorkflow` + `ctx.step()` imperative pattern (validated in the saga-pattern prototype). Workflows are pure composition — they chain steps and pass data between them but never touch the DI container. Steps are the unit of work: each step receives the container, resolves whatever services it needs, and executes. This keeps modules decoupled while giving workflows full cross-module orchestration capability.

Route handlers become thin: parse input, execute workflow, format response.

## User Stories

1. As a developer, I want a single `LinkService` registered once in the DI container, so that I don't need a separate service registration per link table.
2. As a developer, I want `linkService.repo("productVariantInventoryItem")` to return a fully-typed `ProductVariantInventoryItemRepository`, so that I get autocomplete and type checking at every call site.
3. As a developer, I want writable link repositories to extend `BaseRepository`, so that generic CRUD (find, create, softDelete, restore) is inherited without boilerplate.
4. As a developer, I want readonly link repositories to be lightweight classes with only read methods, so that cross-module queries via existing FK columns have a clear access path without implying write capability.
5. As a developer, I want escape-hatch query methods (optimized cross-module JOINs) to live as methods on the specific link repository, so that they are co-located with the link they belong to and don't pollute unrelated link concerns.
6. As a developer, I want a central `LinkRepositoryMap` type that maps link names to repository types, so that adding a new link is one line of type declaration plus the repository class.
7. As a developer, I want to define workflows using `defineWorkflow()` with an imperative `ctx.step()` API, so that orchestration uses standard async/await with real values — no proxies, no DAG, no magic.
8. As a developer, I want workflows to be pure composition that never touches the DI container directly, so that the orchestration logic is testable and engine-swappable.
9. As a developer, I want each step to receive `(input, { container })` and resolve services from the container at runtime, so that steps are the boundary where DI happens and modules stay decoupled.
10. As a developer, I want steps to support optional compensation functions, so that failed workflows can roll back completed steps in reverse order.
11. As a developer, I want the workflow engine to be adapter-swappable (simple in-process adapter vs durable Restate adapter), so that the same workflow code runs in both development and production without changes.
12. As a developer, I want workflows organized in `src/workflows/<domain>/` by domain, so that cross-module orchestration has a clear home outside of any individual module.
13. As a developer, I want steps to be inline in the workflow handler by default, so that small steps don't require indirection through separate files.
14. As a developer, I want to extract a step to the same workflow file when its body is large, so that the workflow handler stays readable.
15. As a developer, I want to extract a step to `src/workflows/<domain>/steps/` only when it is reused across multiple workflows, so that the steps directory appears organically and every file in it is justified by actual reuse.
16. As a developer, I want route handlers to be thin (parse input, call workflow, format response), so that orchestration logic is reusable and not locked to the HTTP layer.
17. As a developer, I want `confirmInventoryWorkflow` to check inventory availability for a cart by chaining steps that call individual module services, so that cart, link, and inventory modules remain decoupled.
18. As a developer, I want the default cross-module data flow to be "steps call module services, workflow assembles the picture," so that each module only touches its own tables.
19. As a developer, I want an escape-hatch pattern where a link repository can host an optimized cross-module JOIN, so that performance-critical queries aren't forced into multiple round trips when UX demands it.
20. As a developer, I want to unit-test pure data transformation functions extracted from workflows with no container and no mocks, so that logic correctness is verified cheaply.
21. As a developer, I want to unit-test individual steps by building a fake Awilix container with `asFunction()` stubs registered under the same `Modules.*` keys, so that I can verify a step resolves the right services and calls them with the right arguments.
22. As a developer, I want to integration-test the `LinkService` against a real Postgres database, so that CRUD operations, escape-hatch queries, and readonly cross-module reads are verified end-to-end.
23. As a developer, I want to integration-test full workflows with a real container and real database, so that the complete orchestration path is validated.

## Implementation Decisions

### LinkService as a Typed Repository Registry

The `LinkService` replaces the current `LinkModuleService`. It is a single class registered once in the shared DI container. Internally, it holds all link repositories (injected via constructor). It exposes a single `repo(name)` method typed against a `LinkRepositoryMap` — a central type that maps link name strings to their concrete repository types.

The `LinkRepositoryMap` is the only central type to maintain when adding a new link. It is a pure type declaration, not runtime code.

```typescript
// Type registry — one line per link
type LinkRepositoryMap = {
  productVariantInventoryItem: ProductVariantInventoryItemRepository  // writable
  cartProduct: CartProductRepository  // readonly
}

// Service interface
class LinkService {
  repo<K extends keyof LinkRepositoryMap>(name: K): LinkRepositoryMap[K]
}
```

### Writable vs Readonly Link Repositories

**Writable link repositories** extend `BaseRepository(table)`. They inherit generic CRUD and can add escape-hatch query methods for performance-critical cross-module JOINs. The existing `ProductVariantInventoryItemRepository` is an example — it already has `getInventoryAvailability()` as a custom method.

**Readonly link repositories** do NOT extend `BaseRepository` (they have no table of their own). They are lightweight classes that receive a `db` dependency and provide custom read methods that join across module boundaries using existing FK columns. For example, `CartProductRepository` could provide `getLineItemsWithProducts(lineItemIds)` that joins `cart_line_item` with `product_variant` and `product` tables.

### Workflow Engine Port

The workflow engine follows the port defined in the saga-pattern prototype. The core types:

```typescript
interface WorkflowContext {
  step<T>(
    name: string,
    action: (input: T, context: { container: AwilixContainer }) => Promise<T>,
    compensation?: (output: T, context: { container: AwilixContainer }) => Promise<void>
  ): Promise<T>
}

interface WorkflowDefinition<TInput, TOutput> {
  name: string
  handler: (ctx: WorkflowContext, input: TInput) => Promise<TOutput>
}
```

Two adapters:
- **Simple adapter** — direct function calls, in-memory compensation list, no retries. Used in development and tests.
- **Restate adapter** — durable journaled execution, automatic retries, crash-surviving compensation. Used in production when durability is needed.

The workflow code is identical across adapters. Only the engine wiring changes.

### Workflow-Step Separation

Workflows are pure composition. They chain `ctx.step()` calls and do plain data transformation between them. They never import or resolve services.

Steps are where services get resolved. Each step receives `(input, { container })` and calls `container.resolve()` to get the module services it needs. This makes steps the natural boundary for:
- **Compensation** — each step can register a rollback function
- **Retry** — the engine adapter decides retry behavior per step
- **Observability** — each step has a name for tracing/logging
- **Testing** — steps can be tested with a fake container

### Step Placement Rules

1. **Default: inline** — small steps stay inside the workflow handler function
2. **Extract to same file** — when the step body is large enough to hurt readability
3. **Extract to `steps/` directory** — only when the step is reused across multiple workflows

### Data Flow Pattern

**Default pattern:** The workflow calls steps that each use individual module services. The workflow assembles the cross-module picture in plain logic between steps. Example for inventory confirmation:

1. Step: resolve cart service, get line items for cart → returns line items with `variantId`
2. Step: resolve link service, get variant-inventory mappings → returns `[{variantId, inventoryItemId, requiredQuantity}]`
3. Step: resolve inventory service, get levels for inventory item IDs → returns inventory levels
4. Workflow: assemble availability map from the three results (pure logic, no step needed)

**Escape hatch:** When the default pattern causes a genuine performance problem (too many queries for a UX-critical path), the link repository can host an optimized cross-module JOIN as a typed method. The step calls this method instead of making separate module service calls. This is the exception, not the rule.

### File Structure

```
backend/src/
  link-modules/
    definitions/
      product-variant-inventory-item.ts   -- pgTable + relations
      readonly/
        cart-product.ts                    -- relations only
    repositories/
      product-variant-inventory-item.ts   -- extends BaseRepository, escape-hatch methods
      cart-product.ts                     -- readonly, custom read methods
    link-service.ts                       -- typed registry, repo() method
    link-repository-map.ts                -- LinkRepositoryMap type
    index.ts                              -- DI registration
  workflows/
    cart/
      confirm-inventory-workflow.ts
      steps/                              -- only when steps are reused
    engine/
      types.ts                            -- WorkflowContext, WorkflowDefinition
      simple-adapter.ts                   -- in-process engine
```

### Changes to Existing Code

- Delete `link-modules/services/link-module-service.ts` — replaced by `LinkService`
- Refactor `link-modules/index.ts` — register `LinkService` instead of the old module pattern
- Thin out `GET /store/carts/:id/inventory` — delegate to `confirmInventoryWorkflow`
- Move `getInventoryAvailability()` — stays on `ProductVariantInventoryItemRepository` where it already is (it was the service that was the problem, not the repo method)
- Add `CartProductRepository` — readonly repo for the cart-product link
- Port workflow engine types and simple adapter from the saga-pattern prototype into `workflows/engine/`

### What Does NOT Change

- Link table definitions (pgTable, relations) stay as-is
- Link migrations stay as-is
- Module services stay as-is — they are not affected by the link service refactor
- `BaseRepository` stays as-is
- `Links` enum stays as-is (entries will be added for new links)
- The two-container bootstrap pattern stays for modules — `LinkService` uses a simpler registration since it's a single service with multiple repos

## Testing Decisions

Testing follows a four-level model adapted from Medusa's patterns. The DI container is the testing seam — steps only know they call `container.resolve(Modules.X)`, so swapping real services for fakes requires no code changes.

### What makes a good test

Test external behavior at boundaries. Do not test repository internals, private methods, or Drizzle query construction. Verify that the right services are called with the right arguments (step tests) and that the end-to-end data flow produces correct results (integration tests).

### Level 1 — Unit Tests (pure utils)

Pure data transformation functions extracted from workflows. No container, no mocks, no DB. Input in, output out. Example: a `prepareConfirmInventoryInput()` function that maps cart line items + inventory links into the shape the confirmation step expects.

Prior art: none yet in this codebase. These are standard pure function tests.

### Level 2 — Unit Tests (steps with fake container)

Individual steps tested with a hand-built Awilix container. Fake module services registered via `asFunction()` under the same `Modules.*` keys the step resolves. Calls recorded in a plain object and asserted on.

```typescript
const buildFakeContainer = () => {
  const calls = { listLineItems: [], listInventoryLevels: [] }
  const container = createContainer()
  container.register(
    Modules.CART,
    asFunction(() => ({
      listLineItems: async (filters) => {
        calls.listLineItems.push(filters)
        return [{ id: "li_1", variantId: "var_1", quantity: 2 }]
      },
    }))
  )
  return { container, calls }
}
```

Prior art: Medusa's step tests (e.g., `process-product-options-for-import.spec.ts`). Adapted to our imperative `ctx.step()` model.

### Level 3 — Integration Tests (LinkService)

Boot a real container with real DB. Test that `linkService.repo("productVariantInventoryItem")` returns a working repository. Test CRUD operations, escape-hatch queries, and readonly cross-module reads.

Prior art: existing module integration tests (`user-module-service.test.ts`, `customer-module-service.test.ts`).

### Level 4 — Integration Tests (workflows)

Boot the full application with real DB. Seed test data via real module services. Execute the workflow. Assert on the result.

Prior art: Medusa's workflow integration tests (e.g., `cancel-order.spec.ts`).

### Compensation testing

Inject a failing step after successful steps to trigger compensation. Verify that data was restored to its pre-workflow state. This validates that compensation functions are correctly registered and executed in reverse order.

## Out of Scope

- Restate adapter implementation (the simple in-process adapter is sufficient for now; Restate adapter exists in the saga-pattern repo as reference)
- Additional link definitions beyond `productVariantInventoryItem` and `cartProduct` (e.g., `orderCart`, `orderPromotion` — these depend on order module which doesn't exist yet)
- Workflow persistence, async execution, or queuing
- Event bus integration with workflows
- Cart creation API routes (needed to test the inventory endpoint with real data, but a separate concern)
- Remote DB schema migration for the inventory module (the remote `inventory_item` table has a different schema than the Drizzle model — this is a deployment concern, not an architectural one)
- Generic link CRUD routing on `LinkService` — Medusa's `Link` class acts as a router with generic `create()` / `dismiss()` / `list()` methods that dispatch to the right link module by inspecting the module+key pairs in the data shape. This enables reusable steps like `createRemoteLinkStep` and `dismissRemoteLinkStep` that work for any link without knowing the repo name. We don't need this yet — with one writable link, calling `linkService.repo("name")` explicitly in each step is clearer and preserves full type safety. When multiple workflows start repeating the same create-link-with-compensation boilerplate across 3+ different links, add generic CRUD methods to `LinkService` that delegate to `BaseRepository` on writable repos. The `repo()` API is additive — this can be layered on without breaking anything.

## Further Notes

- The `LinkModuleService` pattern (one-service-per-link registered via `Module()` + `bootstrapModule()`) was considered and rejected. It creates unnecessary boilerplate: each link needs a definition file, repository file, service file, index.ts, Links enum entry, and bootstrapModule call — even when the service is just a pass-through to the repository. The registry pattern achieves the same type safety with one service and one type declaration per link.
- The one-service-for-everything pattern was also considered and rejected. It becomes a grab bag where `getInventoryAvailability()` sits next to unrelated `getOrderFulfillment()` methods in the same class.
- The workflow engine types should be ported from `/Users/willo/learn/saga-pattern/typescript-patterns-use-cases/src/sagas/port/types.ts` into this prototype's `workflows/engine/` directory. The step signature needs adaptation: the saga prototype uses `() => Promise<T>` for actions, but this prototype needs `(input, { container }) => Promise<T>` so that steps can resolve services from DI.
- ADR 0002 (No Cross-Module Transactions) deferred cross-module consistency to "the workflow/saga layer." This spec delivers that layer.
- The existing `GET /store/carts/:id/inventory` route handler and `LinkModuleService` serve as the concrete "before" state. The refactored versions serve as the "after" — same behavior, cleaner separation.
