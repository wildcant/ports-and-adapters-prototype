# 08 — API routes and webhook endpoint

**What to build:** All 9 payment API routes — store-facing, admin-facing, and the webhook endpoint. The webhook route preserves the raw request body for Stripe signature verification and processes events inline (with a TODO for future event/subscriber pattern).

**Blocked by:** 06 — PaymentModuleService. 07 — Stripe payment provider adapter.

**Status:** ready-for-agent

- [ ] **Store routes:**
  - `GET /store/payment-providers` — lists enabled providers, excluding system (`pp_system_*`)
  - `POST /store/payment-collections/:id/payment-sessions` — creates a payment session for the given collection and provider
- [ ] **Admin routes:**
  - `POST /admin/payment-collections` — creates a payment collection (amount, optional cart linking via link module)
  - `GET /admin/payment-collections/:id` — retrieves a payment collection with sessions, payments, captures, refunds
  - `POST /admin/payments/:id/capture` — captures an authorized payment (full or partial amount)
  - `POST /admin/payments/:id/refund` — refunds a captured payment (full or partial amount, optional refundReasonId and note)
- [ ] **Refund reason routes:**
  - `GET /admin/refund-reasons` — lists all refund reasons
  - `POST /admin/refund-reasons` — creates a refund reason
  - `DELETE /admin/refund-reasons/:id` — deletes a refund reason
- [ ] **Webhook route:**
  - `POST /hooks/payment/:provider` — receives provider webhook, raw body preserved for signature verification
  - Calls `getWebhookActionAndData` on the provider, then processes the action (authorize, capture, fail) inline
  - TODO comment for future event/subscriber system
- [ ] Input validation on all routes
- [ ] Proper error responses (404 for missing resources, 400 for bad input, 409 for invalid state transitions)
- [ ] Type-checks pass
