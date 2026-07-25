# 03 — Payment models, migrations, and repositories

**What to build:** Drizzle schemas for all 8 payment tables and the cart-payment-collection link table, generated migrations, and BaseRepository-based repositories for each entity. The link repository is registered in the existing link service.

**Blocked by:** 02 — Payment types and interfaces.

**Status:** ready-for-agent

- [ ] Drizzle schema for `payment_collection` (id, currencyCode defaulting to 'usd', amount, authorizedAmount, capturedAmount, refundedAmount, status, completedAt, createdAt, updatedAt, deletedAt)
- [ ] Drizzle schema for `payment_session` (id, currencyCode, amount, authorizedAmount, providerId, data JSON, status, paymentCollectionId FK, createdAt, updatedAt, deletedAt)
- [ ] Drizzle schema for `payment` (id, currencyCode, amount, authorizedAmount, providerId, data JSON, paymentCollectionId FK, paymentSessionId FK, customerId, capturedAt, canceledAt, createdAt, updatedAt, deletedAt)
- [ ] Drizzle schema for `capture` (id, amount, paymentId FK, createdAt, deletedAt)
- [ ] Drizzle schema for `refund` (id, amount, paymentId FK, refundReasonId FK, note, createdAt, deletedAt)
- [ ] Drizzle schema for `refund_reason` (id, label, description, createdAt, updatedAt, deletedAt)
- [ ] Drizzle schema for `payment_provider` (id, isEnabled boolean, createdAt, updatedAt, deletedAt)
- [ ] Drizzle schema for `account_holder` (id, providerId, customerId, data JSON, createdAt, updatedAt, deletedAt)
- [ ] Drizzle schema for `cart_payment_collection` link table (cartId, paymentCollectionId, with unique index)
- [ ] Relations defined between all tables (payment_collection has many sessions/payments, payment has many captures/refunds, etc.)
- [ ] BaseRepository subclass for each entity (PaymentCollectionRepository, PaymentSessionRepository, PaymentRepository, CaptureRepository, RefundRepository, RefundReasonRepository, PaymentProviderRepository, AccountHolderRepository)
- [ ] Cart-payment-collection link repository created and registered in link service
- [ ] `Links.CART_PAYMENT_COLLECTION` added to modules-definition
- [ ] Drizzle config created, migration generated and applied
- [ ] Type-checks pass
