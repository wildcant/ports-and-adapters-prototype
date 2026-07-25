# 11. Module Loaders and ModuleProvider for Runtime Adapter Registration

**Status:** Accepted

## Context

Until now, every module's dependencies are statically wired at boot time: `bootstrapModule` creates a local container, registers repositories, instantiates the service, done. Payment breaks this — it needs to discover and register provider adapters at boot time based on configuration (which providers are enabled, with what API keys).

Medusa solves this with two mechanisms: **loaders** (functions that run during module bootstrap) and **ModuleProvider** (a utility that lets provider packages declare themselves as pluggable adapters for a specific module). We need both, adapted to our simpler single-process setup.

## Decision

### Loaders on `ModuleDefinition`

`ModuleDefinition` gains an optional `loaders` array:

```typescript
type LoaderFunction<TOptions = Record<string, unknown>> = (args: {
  container: AwilixContainer  // the module's LOCAL container
  options?: TOptions
}) => void | Promise<void>

Module(Modules.PAYMENT, {
  service: PaymentModuleService,
  repositories: { ... },
  loaders: [loadProviders],
})
```

Loaders run **after** repositories and service are registered in the local container, but **before** the service is exposed to the shared container. They receive the module's local container, so they can register additional dependencies (like provider instances) that the service will resolve at runtime.

### `bootstrapModule` becomes async with options

```typescript
async bootstrapModule<TOptions>(container, moduleDefinition, options?: TOptions)
```

The options are opaque to the bootstrap function — it passes them through to loaders. For the payment module, options carry the provider configuration:

```typescript
await bootstrapModule(container, paymentModule, {
  providers: [{
    resolve: stripeProvider,  // ModuleProviderExports
    id: 'default',
    options: { apiKey: '...', webhookSecret: '...' },
  }],
})
```

### `ModuleProvider` utility

A small function that lets provider packages declare what they export:

```typescript
// providers/payment-stripe/index.ts
export default ModuleProvider(Modules.PAYMENT, {
  services: [StripeProviderService],
})
```

This is a descriptor — it doesn't register anything itself. The module's loader reads it and handles the actual container registration.

### How it fits together

```
container.ts
  └── bootstrapModule(container, paymentModule, { providers: [...] })
        ├── creates local container
        ├── registers repos + service (existing behaviour)
        └── runs loaders:
              └── loadProviders({ container: localContainer, options })
                    ├── registers SystemPaymentProvider as pp_system_default (always)
                    ├── for each options.providers entry:
                    │     resolves ModuleProviderExports → instantiates service class
                    │     registers as pp_{identifier}_{id} in local container
                    └── upserts all provider keys into payment_provider DB table
```

### Why loaders and not constructor injection

The service constructor receives its dependencies via Awilix cradle. But provider instances aren't known at container definition time — they depend on runtime configuration. Loaders run after the container is built but before it's sealed, so they can dynamically register dependencies that the service will later resolve by key.

## Consequences

- Modules that don't need loaders are unaffected — the field is optional and `bootstrapModule` is backward-compatible
- `bootstrapModule` becomes async — all call sites need `await` (one-time migration)
- Provider registration is declarative from the consumer's perspective (`providers: [{ resolve, id, options }]`)
- The `ModuleProvider` utility is intentionally minimal (~5 lines) — it's a descriptor, not a framework
- Adding a new provider to the system is: write the adapter class, export via `ModuleProvider`, add one entry to the `providers` array in `container.ts`
- Loaders are general-purpose — future modules can use them for any boot-time setup (seeding data, registering event handlers, etc.)
