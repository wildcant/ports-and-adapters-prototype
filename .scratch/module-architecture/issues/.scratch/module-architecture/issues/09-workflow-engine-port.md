# 09 — Workflow Engine Port

**What to build:** Port the workflow engine types and simple in-process adapter from the saga-pattern prototype into this project. Adapt the step signature so that steps receive `(input, { container })` instead of a bare closure — this is the integration point between workflows and the Awilix DI container. Workflows are pure composition (chain steps, pass data, never touch the container). Steps are the unit of work where services get resolved. The simple adapter executes steps as direct function calls with an in-memory compensation list (no retries, no persistence).

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `workflows/engine/types.ts` defines `WorkflowContext` (with `step()` method), `WorkflowDefinition`, `WorkflowTerminalError`, and `defineWorkflow()` helper
- [ ] Step signature is `(input, { container: AwilixContainer }) => Promise<T>` — steps resolve services from the container, workflows never do
- [ ] Compensation signature is `(output, { container: AwilixContainer }) => Promise<void>` — registered before the action executes (defensive), runs in reverse on terminal failure
- [ ] `WorkflowTerminalError` triggers compensation; regular errors are engine-dependent (simple adapter treats all as terminal)
- [ ] `workflows/engine/simple-adapter.ts` implements the simple in-process engine: direct function calls, in-memory compensation list, reverse-order rollback on failure
- [ ] `defineWorkflow()` returns a `WorkflowDefinition` that can be executed by any adapter
- [ ] Typechecks pass
- [ ] At least one unit test validates the compensation lifecycle: successful steps register compensations, a terminal failure triggers reverse-order rollback
