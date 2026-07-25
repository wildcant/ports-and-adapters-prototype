# Extract Function

*Source: Refactoring by Martin Fowler — Chapter 6*

## Core principle

If you have to read a fragment of code and figure out **what** it's doing, extract it into a function named after that "what." The function name replaces the mental effort of parsing the implementation.

The decision to extract is about **intention vs implementation distance**, not length or reuse count. A one-line function is worth it if its name communicates intent better than the code itself.

## When to apply

- A comment explains what the next block does — the comment is the function name waiting to be born
- A block of code operates at a different level of abstraction than its surroundings
- You're tempted to write "and" when describing what a function does (it does X **and** Y — split it)
- A local variable is being set up, used, and then never touched again — that's a self-contained unit

## When NOT to apply

- You can't name the extraction better than the code already reads
- The extraction would require passing 4+ parameters — consider other refactorings first (Split Variable, Replace Temp with Query)
- The code is already a single clear expression

## Mechanics

1. Name the new function after its **intent**, not its implementation
2. Copy the code into the new function
3. Pass any variables used-but-not-assigned as parameters
4. If a variable is assigned inside the extracted code and used after it, **return** it
5. If multiple variables need to be returned, that's a smell — rethink the extraction boundaries
6. Replace the original code with a call to the new function

## In our codebase

### `maybeUpdatePaymentCollection_` — good extraction

In `payment-module-service.ts`, the status derivation logic (fetch sessions, payments, captures, refunds → compute aggregate status) is extracted into its own private method. Every mutation that could affect collection status just calls `await this.maybeUpdatePaymentCollection_(collectionId, ctx)`. The caller doesn't need to know how status is derived.

### `retrievePaymentWithRelations_` — good extraction

Fetching a payment with its captures and refunds is a repeated pattern across `capturePayment`, `refundPayment`, `cancelPayment`, and `authorizePaymentSession`. Extracted once, named after intent.

### Watch for: comments as extraction signals

When you see this pattern in a method:

```typescript
// Create the session row first
const session = await this.paymentSessionRepository.create(...)

// Call the provider to initiate payment
const providerResult = await this.paymentProviderService.createSession(...)

// Update session with provider-returned data
const [updated] = await this.paymentSessionRepository.update(...)
```

Each comment marks a potential extraction boundary. The comments are doing the job that function names should do. Whether to extract depends on whether the method is already short enough to read linearly — in `createPaymentSession`, the linear flow is clear enough that extraction would just add indirection.

## Key takeaway

> "If the name of the new function will reveal the intent of the code in a better way, extract it — even if the extraction is a single line."

The test: does reading the call site tell you **what** happens without making you look at **how**?
