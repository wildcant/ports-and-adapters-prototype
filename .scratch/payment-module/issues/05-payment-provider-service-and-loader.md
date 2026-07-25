# 05 — PaymentProviderService + provider loader

**What to build:** The provider facade service that resolves concrete providers from the DI container, and the loader function that registers providers during module bootstrap. When the payment module boots, `loadProviders` discovers configured providers, registers each into the container under `pp_{identifier}_{id}`, and upserts a `payment_provider` row. The system provider is always registered.

**Blocked by:** 03 — Payment models, migrations, and repositories. 04 — AbstractPaymentProvider + SystemPaymentProvider.

**Status:** ready-for-agent

- [ ] `PaymentProviderService` class that takes the Awilix container as a dependency
- [ ] `retrieveProvider(providerId)` resolves a provider instance from container by `pp_{identifier}_{id}` key
- [ ] `listProviders(filters?)` queries the `payment_provider` table for registered/enabled providers
- [ ] `loadProviders` loader function — iterates over options.providers, instantiates each, registers in container, upserts DB row
- [ ] System provider is always registered regardless of options
- [ ] Payment module definition created with `Module(Modules.PAYMENT, { service: PaymentModuleService, loaders: [loadProviders] })` — service can be a stub at this stage
- [ ] Provider resolution works end-to-end: boot module with a provider in options, resolve it by ID
- [ ] Type-checks pass
