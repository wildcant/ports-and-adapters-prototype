# Medusa Payment Module: Complete Deep Dive

## 1. The Big Picture -- What Problem Is Being Solved?

Payments are inherently **asynchronous, multi-step, and provider-dependent**. A customer might pay with a credit card (instant), a bank transfer (takes days), or a voucher (customer walks to a store). The payment module needs to:

- Abstract away provider differences behind a uniform interface
- Track the lifecycle of payment attempts (sessions) separately from confirmed payments
- Handle partial captures and partial refunds
- Process webhooks that arrive asynchronously (sometimes before, sometimes after cart completion)
- Keep financial totals on the parent entity (PaymentCollection) in sync without expensive runtime queries

---

## 2. Data Model -- The Entity Hierarchy

```
PaymentCollection (pay_col_*)          -- "I need $X paid"
  |-- status: not_paid -> awaiting -> partially_authorized -> authorized -> completed
  |-- amount, authorized_amount, captured_amount, refunded_amount
  |-- payment_providers[]              -- M2M: which providers are valid for this collection
  |-- payment_sessions[]               -- 1:N: each attempt with a specific provider
  |     PaymentSession (payses_*)      -- "Customer is trying to pay via Stripe"
  |     |-- status: pending -> authorized | requires_more | error | pending_authorization
  |     |-- provider_id, amount, currency_code
  |     |-- data: {}                   -- OPAQUE provider state (e.g., Stripe PaymentIntent ID)
  |     |-- context: {}                -- customer/idempotency context
  |     +-- authorized_at
  +-- payments[]                       -- 1:N: created ONLY when a session is authorized
        Payment (pay_*)                -- "Money has been authorized"
        |-- amount, currency_code, provider_id
        |-- data: {}                   -- opaque provider state, updated after each operation
        |-- captured_at, canceled_at   -- timestamps act as status flags (no status enum)
        |-- captures[]                 -- 1:N: individual capture events
        |     Capture (capt_*)
        |     +-- amount, created_by
        +-- refunds[]                  -- 1:N: individual refund events
              Refund (ref_*)
              |-- amount, note, created_by
              +-- refund_reason -> RefundReason (refr_*)

AccountHolder (acchld_*)               -- Maps a Medusa customer to a provider-side customer
  |-- provider_id, external_id         -- e.g., Stripe Customer ID
  |-- email, data: {}
  +-- unique on (provider_id, external_id)

PaymentProvider                        -- Registry of known providers
  |-- id (= provider key, e.g., "pp_stripe_default")
  +-- is_enabled: boolean
```

### Key Design Decisions

**Session vs Payment separation.** A `PaymentSession` is a *payment attempt* -- it exists while the customer is choosing and confirming. A `Payment` is created *only upon successful authorization*. This separation means:
- Multiple sessions can exist (customer tries Stripe, fails, switches to PayPal)
- The Payment record is a clean, immutable-ish record of confirmed money
- Sessions can be deleted/replaced without touching confirmed payments

**No status field on Payment.** Instead, `captured_at` and `canceled_at` timestamps serve as status indicators. This avoids invalid state combinations (e.g., "captured AND canceled").

**Capture and Refund as separate entities.** Rather than updating a single amount field, each capture/refund is a row in its own table. This gives you a full audit trail and supports partial captures/refunds naturally.

**Denormalized totals on PaymentCollection.** `authorized_amount`, `captured_amount`, `refunded_amount` are recomputed and written back after every mutation via `maybeUpdatePaymentCollection_()`. This avoids expensive aggregation queries on reads.

---

## 3. The Provider Abstraction -- `AbstractPaymentProvider`

### The Contract

Every payment provider implements 10 required methods:

| Method | When Called | What It Does |
|---|---|---|
| `initiatePayment` | Customer selects provider | Creates a payment intent/session at the gateway |
| `authorizePayment` | Cart completion | Checks/confirms authorization |
| `capturePayment` | Admin captures | Moves money from hold to merchant |
| `cancelPayment` | Admin cancels order | Releases the hold |
| `deletePayment` | Customer switches provider | Cleans up the gateway session |
| `refundPayment` | Admin refunds | Returns money to customer |
| `retrievePayment` | Various | Fetches current state from gateway |
| `updatePayment` | Cart total changes | Updates amount at gateway |
| `getPaymentStatus` | Polling | Gets current status from gateway |
| `getWebhookActionAndData` | Webhook arrives | Parses webhook, returns action + session_id |

Plus 7 optional methods for saved payment methods (account holders, list/save/delete payment methods).

### The `data` Threading Pattern -- The Crucial Design Decision

This is the most important pattern in the whole system. The `data` field is an **opaque `Record<string, unknown>` that threads through the entire lifecycle**:

```
initiatePayment() -> returns { data: { stripe_intent_id: "pi_xxx" } }
                      | stored in PaymentSession.data
authorizePayment({ data: { stripe_intent_id: "pi_xxx" } })
                      | returns new data, stored in Payment.data
capturePayment({ data: { stripe_intent_id: "pi_xxx" } })
                      | returns updated data, stored back in Payment.data
refundPayment({ data: { stripe_intent_id: "pi_xxx" } })
                      | returns updated data, stored back in Payment.data
```

Medusa never looks inside `data`. It just stores it and passes it back. This means:
- Providers can store anything they need (Stripe stores the PaymentIntent ID)
- No schema coupling between Medusa and providers
- The provider always has its own state available without separate lookups

### The Context Object

Every provider method also receives a `context` with:
- `account_holder?: { data: { id: "cus_stripe_xxx" } }` -- the provider's customer record
- `customer?: { email, name, billing_address, ... }` -- Medusa customer data
- `idempotency_key?: string` -- set to the session/capture/refund ID for safe retries

### Provider Identity

```typescript
class StripeProviderService extends StripeBase {
  static identifier = "stripe"  // becomes "pp_stripe_default" in the container
}
```

The `pp_` prefix + `identifier` + `_id` naming convention is how providers are registered in the Awilix DI container and the `payment_provider` DB table.

---

## 4. How Stripe Actually Implements It

### The Two-Level Class Hierarchy

```
AbstractPaymentProvider
  +-- StripeBase (abstract, all the logic)
        |-- StripeProviderService      (identifier: "stripe")
        |-- IdealProviderService       (identifier: "stripe-ideal")
        |-- BancontactProviderService  (identifier: "stripe-bancontact")
        |-- BlikProviderService        (identifier: "stripe-blik")
        +-- ... 4 more regional variants
```

Each subclass only overrides `paymentIntentOptions` to set `payment_method_types` and `capture_method`. All real logic lives in `StripeBase`.

### Key Implementation Details

**`initiatePayment`**: Creates a Stripe PaymentIntent. Embeds `session_id` into `metadata` -- this is how webhooks trace back to the Medusa session. Converts amounts via `getSmallestUnit()` (handles zero-decimal currencies like JPY, three-decimal currencies like KWD).

**`authorizePayment`**: Doesn't actually call Stripe -- it just calls `getPaymentStatus()` and returns the current state. Authorization happens client-side (Stripe.js confirms the intent).

**`capturePayment`**: Calls `stripe.paymentIntents.capture(id)`. Handles the idempotent case where the intent is already `succeeded`.

**Status Mapping** (Stripe -> Medusa):

| Stripe PaymentIntent status | Medusa PaymentSessionStatus |
|---|---|
| `requires_payment_method` (with error) | `error` |
| `requires_payment_method` (no error) | `pending` |
| `requires_action` | `requires_more` (3DS, redirects) |
| `processing` + async method | `pending_authorization` (bank transfers) |
| `requires_capture` | `authorized` (manual capture mode) |
| `succeeded` | `captured` |
| `canceled` | `canceled` |

**Error Handling with Retry**:
```
StripeCardError       -> no retry, return the failed intent data (for webhook reconciliation)
StripeConnectionError -> retry with exponential backoff (3 attempts, jittered delay)
StripeRateLimitError  -> retry
StripeAPIError        -> no retry, return { indeterminate_due_to: "stripe_api_error" }
```

### The System Provider -- A No-Op Stub

`SystemPaymentProvider` is always registered as `pp_system_default`. Every method returns `{ data: {} }`. `authorizePayment` always returns `AUTHORIZED`. Used for "mark as paid" admin flows where no real gateway is involved.

---

## 5. The Module Service -- Orchestration Layer

`PaymentModuleService` extends `MedusaService` (auto-generating CRUD for all 7 models) and adds custom methods for the payment lifecycle.

### The Two-Method Pattern (Public + Protected)

Every mutating operation follows this pattern:

```typescript
// Public: manages the overall transaction boundary, emits events
@InjectManager()
@EmitEvents()
async capturePayment(data, @MedusaContext() ctx) {
  // 1. DB mutation (transactional)
  const result = await this.capturePayment_(data, ctx)
  // 2. Provider call (non-transactional, so DB state is committed first)
  await this.capturePaymentFromProvider_(result, ctx)
  // 3. Recompute collection status
  await this.maybeUpdatePaymentCollection_(paymentCollectionId, ctx)
  return payment
}

// Protected: runs inside a transaction
@InjectTransactionManager()
protected async capturePayment_(data, @MedusaContext() ctx) {
  // Validate, create Capture record
}
```

**Why this split?** The DB transaction commits before the provider call. If the provider call fails, the DB state is still consistent. The provider call is idempotent (uses `idempotency_key`), so retrying is safe.

### `maybeUpdatePaymentCollection_()` -- The Status Recomputation

Called after every authorize/capture/refund. Re-fetches the entire collection graph (sessions + payments + captures + refunds) with `refresh: true` to bypass ORM cache, then:

```
authorizedAmount = sum(session.amount) where session.status === AUTHORIZED
capturedAmount = sum(all capture amounts across all payments)
refundedAmount = sum(all refund amounts across all payments)

status =
  no sessions?          -> NOT_PAID
  sessions exist?       -> AWAITING
  authorizedAmount > 0? -> PARTIALLY_AUTHORIZED or AUTHORIZED (if >= collection.amount)
  capturedAmount >= collection.amount? -> COMPLETED
```

This is a **derived status** -- it's recomputed, not manually transitioned. This means you can't have an invalid status -- it always reflects reality.

### Currency Precision Handling

`roundToCurrencyPrecision()` uses `Intl.NumberFormat` to detect decimal digits per currency (2 for USD, 0 for JPY, 3 for KWD), then rounds amounts accordingly. The refund validation uses an epsilon derived from the currency's decimal precision to handle floating-point rounding.

---

## 6. The Workflow Layer -- Payment Lifecycle

### Why Workflows?

Every payment mutation goes through a workflow (never direct route-to-service calls) because:
- **Compensation**: If step 5 of 7 fails, steps 1-4 can be rolled back
- **Distributed locking**: Cart-level locks prevent race conditions
- **Idempotency**: Workflows can be retried safely
- **Audit trail**: Every step is tracked by the workflow engine

### The Core Workflows

#### Cart Checkout Flow

```
1. POST /store/payment-collections
   -> createPaymentCollectionForCartWorkflow
     - acquireLock(cart_id, timeout=2s, ttl=10s)
     - Create PaymentCollection (amount = cart.raw_total)
     - Link: cart <-> payment_collection
     - releaseLock

2. POST /store/payment-collections/:id/payment-sessions
   -> createPaymentSessionsWorkflow
     - Fetch collection + existing sessions
     - [if customer] Create/find AccountHolder at provider
     - IN PARALLEL:
       - Delete existing sessions (enforces single session, no split pay)
       - Create new session -> provider.initiatePayment()

3. Cart total changes (add item, change shipping, etc.)
   -> refreshPaymentCollectionForCartWorkflow
     - acquireLock(cart_id)
     - Delete all sessions (customer must re-initialize)
     - Update collection amount/currency
     - releaseLock

4. POST /store/carts/:id/complete
   -> completeCartWorkflow
     - acquireLock(cart_id, timeout=30s, ttl=2min)
     - Validate cart has processable payment sessions
     - Register compensation: if later steps fail, refund if captured
     - Create Order (BEFORE authorization -- key design choice)
     - Link: order <-> cart, order <-> payment_collection
     - authorizePaymentSessionStep -> provider.authorizePayment()
       - PENDING_AUTHORIZATION -> return null (deferred auth, order still created)
       - AUTHORIZED -> create Payment record
       - CAPTURED -> create Payment + immediate capture
     - Add order transactions for any captures
     - releaseLock
```

**Critical Decision: Order created BEFORE payment authorization.** This minimizes the window where a payment is authorized but no order exists. If authorization fails, the order creation is compensated (rolled back). If the provider auto-captures, the capture is recorded immediately.

#### Webhook Processing Flow

```
POST /hooks/payment/:provider
  -> Immediately returns 200
  -> Emits "payment.webhook_received" with 5s delay (configurable)
    -> payment-webhook subscriber runs after delay
      -> provider.getWebhookActionAndData(payload)
      -> processPaymentWorkflow runs based on action:

        SUCCESSFUL + Payment exists     -> capturePaymentWorkflow
        SUCCESSFUL + no Payment         -> authorize + capture (autocapture)
        AUTHORIZED + no cart            -> authorizePaymentSessionStep
        AUTHORIZED + order, no payment  -> authorizePaymentSessionStep (deferred)
        AUTHORIZED + cart, no order     -> completeCartAfterPaymentStep
                                           -> re-enters completeCartWorkflow
```

**The 5-second webhook delay** is intentional -- it avoids a race condition where the webhook arrives before the cart completion workflow finishes. The delay is configurable via `webhook_delay` in module options.

**The `session_id` in provider metadata** is how the entire chain works. The Stripe provider embeds `session_id` into the PaymentIntent's `metadata` field at creation time. When a webhook arrives, it reads `intent.metadata.session_id` to find the Medusa session, then traces: session -> payment_collection -> cart -> order.

#### Admin Capture and Refund

```
POST /admin/payments/:id/capture
  -> capturePaymentWorkflow
    - capturePaymentStep -> paymentModule.capturePayment (no compensation -- money moved)
    - Find associated order via order_payment_collection link
    - Add order transaction (reference: "capture")
    - Emit payment.captured event

POST /admin/payments/:id/refund
  -> refundPaymentWorkflow
    - Validate refund doesn't exceed captured amount
    - refundPaymentStep -> paymentModule.refundPayment (no compensation)
    - Add order transaction (reference: "refund", negative amount)
    - Create credit lines if refund exceeds pending difference
    - Emit payment.refunded event
```

**No compensation on capture/refund steps** -- once money moves, you can't automatically undo it. Only `authorizePaymentSessionStep` has compensation (cancels the payment at the provider).

---

## 7. Integration with the Rest of Medusa

### Link Modules -- Cross-Module Joins

Payment entities are connected to other modules via **link tables** (separate join-table modules):

| Link | Table | Purpose |
|---|---|---|
| Cart <-> PaymentCollection | `cart_payment_collection` | Associates checkout payment with cart |
| Order <-> PaymentCollection | `order_payment_collection` | Associates payment with placed order (`deleteCascade`) |
| OrderClaim <-> PaymentCollection | `order_claim_payment_collection` | Claim refund payments |
| OrderExchange <-> PaymentCollection | `order_exchange_payment_collection` | Exchange payments |
| Region <-> PaymentProvider | `region_payment_provider` | Which providers available per region |

These are queried via `useRemoteQueryStep` in workflows to traverse module boundaries.

### Provider Registration at Boot

```
Module loads -> loadProviders() runs:
  1. Always register SystemPaymentProvider as pp_system_default
  2. If cloud config present, register MedusaPaymentsProvider as pp_medusa-payments_default
  3. Process user-configured providers from medusa-config.ts
  4. Upsert all provider keys into payment_provider table
     - Active providers -> is_enabled: true
     - Previously active but now removed -> is_enabled: false
```

### Event System

Two layers of events:
1. **ORM-level**: Auto-generated by `MedusaService` for every entity mutation (`payment.payment-session.created`, `payment.payment.updated`, etc.)
2. **Workflow-level**: Explicit domain events (`payment.captured`, `payment.refunded`, `payment.webhook_received`)

---

## 8. API Routes

### Admin Routes

| Method | Path | Action |
|---|---|---|
| `GET` | `/admin/payments` | List payments |
| `GET` | `/admin/payments/:id` | Retrieve payment |
| `POST` | `/admin/payments/:id/capture` | Capture payment (optional `amount`) |
| `POST` | `/admin/payments/:id/refund` | Refund payment (optional `amount`, `refund_reason_id`, `note`) |
| `GET` | `/admin/payments/payment-providers` | List payment providers |
| `POST` | `/admin/payment-collections` | Create collection for an order (`order_id`, `amount`) |
| `DELETE` | `/admin/payment-collections/:id` | Delete collection (must be `not_paid`) |
| `POST` | `/admin/payment-collections/:id/mark-as-paid` | Mark as paid via system provider |
| `POST` | `/admin/payment-collections/:id/payment-sessions` | Create payment session |

### Store Routes

| Method | Path | Action |
|---|---|---|
| `POST` | `/store/payment-collections` | Create collection for a cart (`cart_id`) |
| `POST` | `/store/payment-collections/:id/payment-sessions` | Create session (passes `customer_id`) |
| `GET` | `/store/payment-providers` | List providers (requires `region_id` filter) |

### Webhook Route

| Method | Path | Action |
|---|---|---|
| `POST` | `/hooks/payment/:provider` | Receive provider webhook (preserves raw body) |

All mutating routes follow the pattern: invoke workflow -> re-fetch entity -> return JSON. Read-only routes query directly via `remoteQuery`.

---

## 9. Full Data Flow: End-to-End Payment Lifecycle

```
1. Cart Created
   +-- no payment_collection yet

2. POST /store/payment-collections  (store route)
   -> createPaymentCollectionForCartWorkflow
       |-- acquireLock(cart_id)
       |-- validateCartStep (not completed)
       |-- validateExistingPaymentCollectionStep (no existing collection)
       |-- createPaymentCollectionsStep -> paymentModule.createPaymentCollections
       |-- createRemoteLinkStep: cart <-> payment_collection
       +-- releaseLock(cart_id)

3. POST /store/payment-collections/:id/payment-sessions  (store route)
   -> createPaymentSessionsWorkflow
       |-- fetch paymentCollection (amount, currency, existing sessions)
       |-- [if customer_id] fetch customer + account_holders
       |-- [if customer_id] createPaymentAccountHolderStep -> paymentModule.createAccountHolder
       |-- [if new account holder] createRemoteLinkStep: customer <-> account_holder
       +-- parallelize:
           |-- createPaymentSessionStep -> paymentModule.createPaymentSession
           |   |-- paymentSessionService_.create (status=PENDING initially)
           |   |-- paymentProviderService_.createSession  [EXTERNAL CALL]
           |   +-- paymentSessionService_.update (data + status from provider)
           +-- deletePaymentSessionsWorkflow (removes any prior sessions)

4. Cart Total Changes (any update workflow)
   -> refreshPaymentCollectionForCartWorkflow
       |-- acquireLock(cart_id)
       |-- if amount or currency changed:
       |   |-- deletePaymentSessionsWorkflow (clears sessions)
       |   +-- updatePaymentCollectionStep -> paymentModule.updatePaymentCollections
       +-- releaseLock(cart_id)

5. POST /store/carts/:id/complete
   -> completeCartWorkflow
       |-- acquireLock(cart_id)
       |-- [idempotency] check order_cart link for existing order
       |-- validateCartItemsStep
       |-- validateCartPaymentsStep -> returns processable payment sessions
       |-- compensatePaymentIfNeededStep (no-op forward; compensation = refund if captured)
       |-- [if no existing order]:
       |   |-- createOrdersStep (status=PENDING)
       |   |-- createRemoteLinkStep: order <-> cart, order <-> payment_collection
       |   |-- updateCartsStep (completed_at)
       |   |-- reserveInventoryStep
       |   |-- emitEventStep(ORDER_PLACED)
       |   |-- authorizePaymentSessionStep({ id: paymentSessions[0].id })
       |   |   |-- paymentModule.authorizePaymentSession  [EXTERNAL CALL]
       |   |   |-- -> if PENDING_AUTHORIZATION: returns null (deferred)
       |   |   |-- -> if AUTHORIZED: creates Payment record
       |   |   +-- -> if CAPTURED: creates Payment record + immediately captures
       |   +-- addOrderTransactionStep (capture -> order transaction)
       +-- releaseLock(cart_id)

6. [Webhook received from payment provider]
   -> processPaymentWorkflow({ action, data: { session_id, amount } })
       |-- query payment, payment_session, cart_payment_collection, order_cart
       |-- acquireLock(cartId) if cart exists
       |-- [action=SUCCESSFUL, payment exists] -> capturePaymentWorkflow
       |-- [action=SUCCESSFUL, no payment]     -> authorize + capturePaymentWorkflow
       |-- [action=AUTHORIZED, no cart]         -> authorizePaymentSessionStep (standalone)
       |-- [action=AUTHORIZED, order, no pay]   -> authorizePaymentSessionStep (deferred)
       |-- releaseLock(cartId)
       +-- [action=*, cartId, no order] -> completeCartAfterPaymentStep
           +-- WorkflowEngine.run("complete-cart", { id: cart_id })

7. POST /admin/payments/:id/capture  (admin route)
   -> capturePaymentWorkflow
       |-- capturePaymentStep -> paymentModule.capturePayment
       |   |-- capturePayment_: validates not canceled/captured, creates Capture record
       |   |-- capturePaymentFromProvider_  [EXTERNAL CALL]
       |   +-- maybeUpdatePaymentCollection_ (recalculates status)
       |-- useRemoteQueryStep: find order via order_payment_collection
       |-- [if order] addOrderTransactionStep (reference="capture")
       +-- emitEventStep(PAYMENT_CAPTURED)

8. POST /admin/payments/:id/refund  (admin route)
   -> refundPaymentWorkflow
       |-- fetch payment (captures + refunds)
       |-- [if amount specified] validateRefundPaymentExceedsCapturedAmountStep
       |-- refundPaymentStep -> paymentModule.refundPayment
       |   |-- refundPayment_: validates amount, creates Refund record
       |   |-- refundPaymentFromProvider_  [EXTERNAL CALL]
       |   +-- maybeUpdatePaymentCollection_ (recalculates status)
       |-- [if order] addOrderTransactionStep (reference="refund", negative amount)
       +-- emitEventStep(PAYMENT_REFUNDED)
```

---

## 10. Summary of Key Design Decisions

| Decision | Why |
|---|---|
| **Session/Payment separation** | Clean separation between attempts and confirmed money |
| **Opaque `data` bag threaded through lifecycle** | Zero coupling between Medusa and providers; provider stores whatever it needs |
| **No status enum on Payment** | `captured_at`/`canceled_at` timestamps prevent invalid state combinations |
| **Captures/Refunds as separate rows** | Full audit trail, natural partial support |
| **Denormalized totals on PaymentCollection** | Fast reads without aggregation queries |
| **Derived collection status** | Status always reflects reality, can't go stale |
| **Order created BEFORE authorization** | Minimizes orphaned-payment risk |
| **5s webhook delay** | Avoids race with synchronous cart completion |
| **session_id in provider metadata** | Enables webhook -> session -> cart -> order tracing |
| **Workflows for all mutations** | Compensation, locking, idempotency, audit |
| **No compensation on capture/refund** | Can't auto-undo money movement |
| **Provider as Awilix singleton** | Single SDK client instance per provider |
| **Currency precision via Intl.NumberFormat** | Correct rounding for all world currencies without a hardcoded table |
| **`pending_authorization` status** | Supports async payment methods (bank transfers, vouchers) without blocking order creation |

---

## 11. Key File References

| Purpose | Path |
|---|---|
| Module definition | `packages/modules/payment/src/index.ts` |
| Main orchestration service | `packages/modules/payment/src/services/payment-module.ts` |
| Provider facade | `packages/modules/payment/src/services/payment-provider.ts` |
| Provider registration loader | `packages/modules/payment/src/loaders/providers.ts` |
| Models | `packages/modules/payment/src/models/*.ts` |
| System provider | `packages/modules/payment/src/providers/system.ts` |
| Medusa Cloud provider | `packages/modules/payment/src/providers/payment-medusa/services/medusa-payments.ts` |
| Joiner config (linkable keys) | `packages/modules/payment/src/joiner-config.ts` |
| Abstract provider base class | `packages/core/utils/src/payment/abstract-payment-provider.ts` |
| Provider interface + I/O types | `packages/core/types/src/payment/provider.ts` |
| Service interface | `packages/core/types/src/payment/service.ts` |
| DTOs and status types | `packages/core/types/src/payment/common.ts` |
| Mutation DTOs | `packages/core/types/src/payment/mutations.ts` |
| Status enums | `packages/core/utils/src/payment/payment-session.ts`, `payment-collection.ts` |
| Webhook enums | `packages/core/utils/src/payment/webhook.ts` |
| Stripe shared logic | `packages/modules/providers/payment-stripe/src/core/stripe-base.ts` |
| Stripe module entry (8 services) | `packages/modules/providers/payment-stripe/src/index.ts` |
| Stripe currency conversion | `packages/modules/providers/payment-stripe/src/utils/get-smallest-unit.ts` |
| Payment workflows | `packages/core/core-flows/src/payment/workflows/*.ts` |
| Payment steps | `packages/core/core-flows/src/payment/steps/*.ts` |
| Cart payment workflows | `packages/core/core-flows/src/cart/workflows/create-payment-collection-for-cart.ts` |
| Cart completion | `packages/core/core-flows/src/cart/workflows/complete-cart.ts` |
| Payment session workflow | `packages/core/core-flows/src/payment-collection/workflows/create-payment-session.ts` |
| Webhook HTTP entry | `packages/medusa/src/api/hooks/payment/[provider]/route.ts` |
| Webhook subscriber | `packages/medusa/src/subscribers/payment-webhook.ts` |
| Admin payment routes | `packages/medusa/src/api/admin/payments/` |
| Store payment routes | `packages/medusa/src/api/store/payment-collections/` |
| Link: Cart <-> PaymentCollection | `packages/modules/link-modules/src/definitions/cart-payment-collection.ts` |
| Link: Order <-> PaymentCollection | `packages/modules/link-modules/src/definitions/order-payment-collection.ts` |
| Link: Region <-> PaymentProvider | `packages/modules/link-modules/src/definitions/region-payment-provider.ts` |
