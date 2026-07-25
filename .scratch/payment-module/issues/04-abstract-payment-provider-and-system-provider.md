# 04 — AbstractPaymentProvider + SystemPaymentProvider

**What to build:** An abstract base class that all payment providers extend, plus the built-in system provider that ships with the module. The system provider is always registered and handles admin/testing scenarios with no-op/pass-through behaviour.

**Blocked by:** 02 — Payment types and interfaces.

**Status:** ready-for-agent

- [ ] `AbstractPaymentProvider` class in `core/utils/` — implements `IPaymentProvider` with abstract methods for the full lifecycle
- [ ] Static `identifier` property pattern for provider registration key
- [ ] `SystemPaymentProvider` in `modules/payment/providers/system/` extending `AbstractPaymentProvider`
- [ ] System provider `identifier` is `"system"`
- [ ] `initiatePayment` returns success with empty data
- [ ] `authorizePayment` returns authorized status
- [ ] `capturePayment` returns empty data
- [ ] `refundPayment` returns empty data
- [ ] `cancelPayment` / `deletePayment` return empty data
- [ ] `retrievePayment` returns empty data
- [ ] `getPaymentStatus` returns authorized
- [ ] `getWebhookActionAndData` returns not-supported indication
- [ ] Saved payment method operations return empty/not-supported
- [ ] Type-checks pass
