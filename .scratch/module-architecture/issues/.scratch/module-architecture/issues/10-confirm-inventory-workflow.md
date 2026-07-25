# 10 — Confirm Inventory Workflow

**What to build:** Create a `confirmInventoryWorkflow` that checks inventory availability for a cart's line items by orchestrating across cart, link, and inventory modules through steps. Refactor the existing `GET /store/carts/:id/inventory` route handler to be thin — it parses the cart ID, executes the workflow, and formats the response. The workflow proves the full pattern end-to-end: workflows are pure composition, steps resolve services from the container, module services stay decoupled.

**Blocked by:** 08 — Link Service Registry, 09 — Workflow Engine Port

**Status:** ready-for-agent

- [ ] `workflows/cart/confirm-inventory-workflow.ts` defines the workflow using `defineWorkflow()` with inline steps
- [ ] Step 1: resolves cart service from container, fetches line items for the given cart ID
- [ ] Step 2: resolves link service from container, gets variant-inventory mappings via `linkService.repo("productVariantInventoryItem")` for the line items' variant IDs
- [ ] Step 3: resolves inventory service from container, gets inventory levels for the mapped inventory item IDs
- [ ] Workflow assembles the availability result from the three step outputs (pure logic, no step needed) — maps each line item to its available quantity across locations, computes `sufficient` per item and `allSufficient` overall
- [ ] `GET /store/carts/:id/inventory` route is thin: parses cart ID from params, executes `confirmInventoryWorkflow` via the simple engine adapter, returns the workflow result as JSON
- [ ] Response shape matches the existing endpoint contract (`{ cartId, allSufficient, items: [...] }`)
- [ ] The workflow never imports or resolves services directly — only steps do
- [ ] Typechecks pass
