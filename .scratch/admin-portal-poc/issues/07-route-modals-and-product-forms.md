# 07 — Admin: Route-based modals and product forms

**What to build:** Navigating to `/products/create` opens a full-screen Drawer overlay with a title-only product create form. Navigating to `/products/:id/edit` opens a slide-in Drawer panel with a title-only product edit form. Both modal types are built on `Drawer` from `@proteus/ui`: `RouteFocusModal` uses the full-screen variant, `RouteDrawer` uses `swipeDirection="right"` for the slide-in panel. A `RouteModalForm` wrapper integrates TanStack Router's `useBlocker` for dirty-form blocking — if the form has unsaved changes and the user tries to navigate away, a confirmation dialog appears with proceed/cancel options. Forms use TanStack Form with zod validation (schemas from `@proteus/http-schemas`). The `TextField` component follows the frontend's established pattern (`useFieldContext` + `Input` from `@proteus/ui` + `FieldError`). Submitting the create form creates the product and navigates to the new product's detail page. Submitting the edit form updates the product, closes the drawer, and refreshes the detail page data via query invalidation.

**Blocked by:** 04 — DataTable system + Product list page, 06 — Product detail page

**Status:** ready-for-agent

**Reference files to study:**

- Medusa source — route-based modal components (port structure, use `Drawer` from `@proteus/ui`):
  - `medusa-source/packages/admin/dashboard/src/components/modals/route-drawer/route-drawer.tsx` — RouteDrawer (slide-in panel)
  - `medusa-source/packages/admin/dashboard/src/components/modals/route-focus-modal/route-focus-modal.tsx` — RouteFocusModal (full-screen overlay)
  - `medusa-source/packages/admin/dashboard/src/components/modals/route-modal-form/route-modal-form.tsx` — RouteModalForm with dirty-form blocking
  - `medusa-source/packages/admin/dashboard/src/components/modals/route-modal-provider/route-modal-context.tsx` — modal context
- Medusa source — product create/edit forms:
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-create/product-create.tsx` — create route
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-create/components/product-create-form/product-create-form.tsx` — create form
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-edit/product-edit.tsx` — edit route
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-edit/components/edit-product-form/edit-product-form.tsx` — edit form
- Proteus — existing form pattern to follow:
  - `apps/frontend/src/components/form/text-field.tsx` — TextField with `useFieldContext`, `Input` from `@proteus/ui`, FieldError
- `@proteus/ui` — component to add to the shared package (via `shadcn add` in `packages/ui`), then export and import in admin:
  - Drawer: https://ui.shadcn.com/docs/components/base/drawer

- [ ] `RouteDrawer` component wraps `Drawer` from `@proteus/ui` with `swipeDirection="right"`, provides `onClose` that navigates to parent route, compound children (`.Header`, `.Title`, `.Body`, `.Footer`)
- [ ] `RouteFocusModal` component wraps `Drawer` from `@proteus/ui` in full-screen variant, provides `onClose` that navigates to parent route, compound children (`.Header`, `.Title`, `.Body`, `.Footer`)
- [ ] `RouteModalForm` wrapper uses `useBlocker({ shouldBlockFn, withResolver: true, enableBeforeUnload })` to block navigation when form is dirty
- [ ] `shouldBlockFn` returns `false` if submit was successful (tracked via ref), otherwise returns `form.state.isDirty`
- [ ] Blocked state renders a confirmation dialog with "Discard changes" (calls `proceed()`) and "Keep editing" (calls `reset()`)
- [ ] `TextField` component using `useFieldContext<string>()`, `Input` from `@proteus/ui`, `FieldLabel`, `FieldError` — matching the frontend pattern
- [ ] `products/create.tsx` route renders `RouteFocusModal` with a create form (single title field, required)
- [ ] Create form submits via `useCreateProduct` mutation, navigates to `/products/$id` on success
- [ ] Handle is auto-generated on the backend — form only sends title
- [ ] `products/$id/edit.tsx` route renders `RouteDrawer` with an edit form (single title field, pre-populated)
- [ ] Edit form submits via `useUpdateProduct` mutation, closes drawer on success, detail page data refreshes via cache invalidation
- [ ] Both modals are URL-addressable: navigating directly to `/products/create` or `/products/:id/edit` opens them correctly
- [ ] Both modals animate in on mount and out on close
- [ ] Form validation uses zod schemas from `@proteus/http-schemas` (CreateProduct, UpdateProduct)
