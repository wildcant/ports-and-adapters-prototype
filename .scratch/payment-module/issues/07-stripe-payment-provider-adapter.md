# 07 — Stripe payment provider adapter

**What to build:** A concrete Stripe payment provider that extends `AbstractPaymentProvider`, colocated in `providers/payment-stripe/`. It wraps the Stripe SDK to handle payment intents, captures, refunds, webhook verification, and saved payment methods. Exported via `ModuleProvider()` and wired into the payment module through bootstrap options.

**Blocked by:** 04 — AbstractPaymentProvider + SystemPaymentProvider. 01 — Infrastructure (ModuleProvider utility).

**Status:** ready-for-agent

- [ ] `StripeProviderService` extending `AbstractPaymentProvider` with `identifier = "stripe"`
- [ ] Constructor accepts Stripe API key from provider options/env
- [ ] `initiatePayment` creates a Stripe PaymentIntent with `captureMethod: 'manual'`, returns `{ id: pi_xxx }` as session data
- [ ] `authorizePayment` confirms the PaymentIntent, returns authorized status
- [ ] `capturePayment` captures the PaymentIntent (supports partial via amount)
- [ ] `refundPayment` creates a Stripe Refund (supports partial via amount)
- [ ] `cancelPayment` cancels the PaymentIntent
- [ ] `deletePayment` cancels if not already canceled
- [ ] `retrievePayment` fetches PaymentIntent from Stripe
- [ ] `getPaymentStatus` maps Stripe PaymentIntent status to `PaymentSessionStatus`
- [ ] `getWebhookActionAndData` verifies Stripe signature, parses event, maps to action (authorized/captured/failed)
- [ ] `listPaymentMethods` lists saved payment methods for a Stripe Customer
- [ ] `savePaymentMethod` attaches a payment method to a Stripe Customer
- [ ] `deletePaymentMethod` detaches a payment method from a Stripe Customer
- [ ] Exported via `ModuleProvider(Modules.PAYMENT, { services: [StripeProviderService] })`
- [ ] `stripe` npm dependency added
- [ ] Type-checks pass
