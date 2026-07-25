# 02 — Payment types and interfaces

**What to build:** All payment-related TypeScript types, DTOs, enums, and service/provider interfaces in `core/types/`. This is the full type contract that every other ticket builds against — no runtime code, only types.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Enums: `PaymentCollectionStatus` (not_paid, awaiting, authorized, partially_authorized, canceled), `PaymentSessionStatus` (pending, requires_more, authorized, captured, error, canceled)
- [ ] DTOs: `PaymentCollectionDTO`, `PaymentSessionDTO`, `PaymentDTO`, `CaptureDTO`, `RefundDTO`, `RefundReasonDTO`, `PaymentProviderDTO`, `AccountHolderDTO`
- [ ] Mutation types: `CreatePaymentCollectionDTO`, `CreatePaymentSessionDTO`, `CapturePaymentDTO`, `RefundPaymentDTO`, `CreateRefundReasonDTO`, `UpdateRefundReasonDTO`, `CreateAccountHolderDTO`, `UpdateAccountHolderDTO`
- [ ] Filterable types for list operations
- [ ] `IPaymentProvider` interface with full lifecycle: `initiatePayment`, `authorizePayment`, `capturePayment`, `refundPayment`, `cancelPayment`, `deletePayment`, `retrievePayment`, `getPaymentStatus`, `getWebhookActionAndData`, plus saved payment method operations (`listPaymentMethods`, `savePaymentMethod`, `deletePaymentMethod`)
- [ ] `PaymentMethodContext` and `PaymentMethodResponse` types for saved payment methods
- [ ] `IPaymentModuleService` interface covering all orchestration methods
- [ ] All types exported from `core/types/index.ts`
- [ ] Type-checks pass
