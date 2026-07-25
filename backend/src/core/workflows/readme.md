# Workflow Engine

A lightweight, step-based workflow engine inspired by [Medusa's workflow system](https://docs.medusajs.com/learn/fundamentals/workflows). Workflows compose multi-step operations with automatic rollback (saga pattern) when a step fails.

## Quick start

```ts
import { createWorkflow, WorkflowTerminalError } from '@core/workflows/types.js'

export const checkoutWorkflow = createWorkflow<{ cartId: string }, void>(
  'checkout',
  async (ctx, input) => {
    const reservation = await ctx.step(
      'reserve-inventory',
      async ({ container }) => {
        const inventory = container.resolve('inventoryService')
        return inventory.reserve(input.cartId)
      },
      // Compensation — runs automatically if a later step fails
      async (reservation, { container }) => {
        const inventory = container.resolve('inventoryService')
        await inventory.release(reservation.id)
      },
    )

    await ctx.step('charge-payment', async ({ container }) => {
      const payment = container.resolve('paymentService')
      const ok = await payment.charge(input.cartId)
      if (!ok) throw new WorkflowTerminalError('Payment declined')
      // ^ If this throws, the reserve-inventory compensation runs
    })
  },
)

// Call it like a function — the global engine runs it
await checkoutWorkflow.run({ cartId: 'cart_123' })
```

## Architecture

The engine follows the same ports & adapters pattern as the rest of the codebase:

```
types.ts          — Port interfaces (WorkflowEngine, WorkflowContext, etc.)
simple-adapter.ts — In-process adapter (runs steps sequentially, compensates on error)
```

### Key types

| Type | Role |
|------|------|
| `WorkflowEngine` | Driven port — how steps are executed and compensated |
| `WorkflowContext` | Provides `ctx.step()` inside a workflow handler |
| `Workflow<TInput, TOutput>` | A defined workflow with a `.run(input)` method |
| `WorkflowTerminalError` | Signals an unrecoverable failure (triggers compensation) |
| `StepContext` | Passed to every step action — contains the DI `container` |

### Global registration

At startup, call `setWorkflowEngine()` once to wire the engine and DI container:

```ts
import { createSimpleWorkflowEngine } from '@core/workflows/simple-adapter.js'
import { setWorkflowEngine } from '@core/workflows/types.js'

setWorkflowEngine(createSimpleWorkflowEngine(), container)
```

After this, any workflow created with `createWorkflow()` can call `.run(input)` without passing an engine or container — they use the global registration implicitly.

## Features

### Steps with compensation (saga pattern)

Each step can optionally register a compensation function. If any step throws, all previously completed compensations run in **reverse order** — like unwinding a stack:

```ts
await ctx.step('step-name', action, compensation)
//                          ^^^^^^  ^^^^^^^^^^^^
//                          runs    runs on rollback (receives action's return value)
```

- Only **completed** steps are compensated — a step whose action threw is skipped
- Compensation errors are swallowed so all compensations get a chance to run
- Steps without a compensation function are simply skipped during rollback

### WorkflowTerminalError

Throw `WorkflowTerminalError` to signal a business-rule failure. It supports an optional `cause` for wrapping lower-level errors:

```ts
throw new WorkflowTerminalError(
  'Insufficient inventory',
  new AppError({ type: AppError.Types.INVALID_DATA, message: 'SKU-001 out of stock' }),
)
```

### Workflow configuration

`createWorkflow` accepts either a name string or a config object:

```ts
createWorkflow('my-workflow', handler)
createWorkflow({ name: 'my-workflow', idempotent: true }, handler)
```

The `idempotent` flag is metadata for engines that support deduplication (the simple adapter ignores it).

### DI container access

Every step receives the Awilix container, so steps resolve services the same way route handlers do:

```ts
await ctx.step('fetch-data', async ({ container }) => {
  const cartService = container.resolve<ICartModuleService>(Modules.CART)
  return cartService.listLineItems({ cartId })
})
```

## Simple adapter

`createSimpleWorkflowEngine()` is an in-process engine that:

1. Runs steps sequentially in the order they appear
2. Treats **all** errors as terminal (triggers compensation)
3. Runs compensations in reverse order, swallowing compensation errors
4. Re-throws the original error after compensation completes

This is sufficient for single-process deployments. A distributed adapter (e.g. Temporal, Inngest) could implement the same `WorkflowEngine` interface with durable execution, retries, and async step orchestration.

## Testing

Workflows are testable without a real database — mock the services and register them in a test container:

```ts
const container = createContainer()
container.register({
  [Modules.CART]: asValue(mockCartService),
  [Modules.INVENTORY]: asValue(mockInventoryService),
})

setWorkflowEngine(createSimpleWorkflowEngine(), container)

const result = await myWorkflow.run({ cartId: 'cart_1' })
```

Tests live in `__tests__/simple-adapter.test.ts`.
