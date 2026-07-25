# 06 — PaymentModuleService (orchestration)

**What to build:** The main payment module service implementing `IPaymentModuleService`. It orchestrates the full payment lifecycle by coordinating repositories and the provider service. This is the driving port that API routes will call.

**Blocked by:** 05 — PaymentProviderService + provider loader.

**Status:** ready-for-agent

- [ ] **Payment collections:** `createPaymentCollections`, `retrievePaymentCollection`, `listPaymentCollections`, `completePaymentCollections` (validates all sessions authorized before completing), `cancelPaymentCollections`
- [ ] **Payment sessions:** `createPaymentSession` (calls provider's `initiatePayment`, creates session row), `authorizePaymentSession` (calls provider, on success creates Payment row), `deletePaymentSession`
- [ ] **Captures:** `capturePayment` (calls provider's `capturePayment`, creates Capture row, updates Payment amounts)
- [ ] **Refunds:** `refundPayment` (calls provider's `refundPayment`, creates Refund row, updates Payment amounts)
- [ ] **Derived status:** `maybeUpdatePaymentCollection_()` private method that recomputes `PaymentCollectionStatus` from child session statuses after every mutation
- [ ] **Refund reasons:** CRUD operations (create, list, update, delete)
- [ ] **Account holders:** CRUD operations (create, retrieve, update, delete), looked up by customerId + providerId
- [ ] **Saved payment methods:** `listPaymentMethods`, `savePaymentMethod`, `deletePaymentMethod` — all delegated to the provider via PaymentProviderService, with optional AccountHolder resolution
- [ ] Module registered in shared container and resolves correctly
- [ ] Type-checks pass
