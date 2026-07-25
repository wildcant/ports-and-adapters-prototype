# Replace Nested Conditional with Guard Clauses

*Source: Refactoring by Martin Fowler — Chapter 10*

## Core principle

Conditionals come in two styles:

- **Both legs are normal** — use `if/else`. This signals equal weight to the reader.
- **One leg is unusual/exceptional** — use a guard clause (check and return/throw early). This signals "dismiss this edge case and move on."

Guard clauses let the reader **skip past** the unusual cases and read the happy path as a straight, un-nested line.

## When to apply

- The happy path is buried inside an `if` block while the else/fallthrough handles the edge case
- Multiple levels of nesting where each level is really just "if this unusual thing, bail out"
- You find yourself tracking which `if` branch you're in to understand the main logic

## When NOT to apply

- Both branches are equally likely outcomes (e.g., a status waterfall where all states are "normal") — keep `if/else-if`
- The guard would need to duplicate cleanup/teardown logic that the non-guard structure handles naturally

## Mechanics

1. Identify the outermost condition that handles an unusual case
2. Convert it into a guard clause — check the condition and `return`/`throw` immediately
3. Test
4. Repeat for the next nested condition
5. If multiple guards return the same value, consolidate them into a single condition
6. Remove any `result` variables that are no longer needed (each removed mutable variable is a win)

## Reversing conditions

Often the unusual case is the "else" branch. Invert the condition so the guard checks for the unusual case first:

```typescript
// Before: happy path inside the if, unusual case falls through
if (status === 'authorized' || status === 'captured') {
  // ... 20 lines of happy path
}
// fall through to return null

// After: guard dismisses the unusual case, happy path is the straight line
if (status !== 'authorized' && status !== 'captured') {
  return null
}
// ... happy path reads linearly
```

## In our codebase

### `authorizePaymentSession` — applied this refactoring

We refactored this method from nested status checks into guard clauses:

```typescript
// Guard: async flow, not done yet
if (status === 'pending_authorization') return null

// Guard: non-success statuses
if (status !== 'authorized' && status !== 'captured') {
  await this.maybeUpdatePaymentCollection_(session.paymentCollectionId, context)
  return null
}

// Happy path: create Payment record — no nesting
const payment = await this.paymentRepository.create(...)
```

The edge cases are dismissed at the top. The reader doesn't need to track which branch they're in.

### `capturePayment` / `refundPayment` — already used guard clauses

These methods validate preconditions up front and throw:

```typescript
if (payment.canceledAt) throw ...   // guard: can't capture canceled payment
if (captureAmount <= 0) throw ...   // guard: nothing left to capture
if (captureAmount > remaining) throw ... // guard: amount too high
// happy path proceeds un-nested
```

This is the pattern. Unusual conditions are handled and dismissed, the happy path flows linearly.

### `maybeUpdatePaymentCollection_` — NOT a candidate

The `if/else-if` chain deriving collection status (`completed`, `authorized`, `partially_authorized`, `awaiting`, `not_paid`) treats all branches as normal behavior with equal weight. Guard clauses would be wrong here — `if/else-if` correctly communicates that these are all legitimate states.

## Key takeaway

> Guard clauses say: "this isn't the core of this function — handle it and get out." The remaining un-nested code is the main story.

The test: can the reader dismiss edge cases by scanning the top of the function, then read the happy path linearly without tracking nesting depth?
