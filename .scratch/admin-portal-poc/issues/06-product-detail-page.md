# 06 — Admin: Product detail page

**What to build:** Navigating to `/products/:id` shows a two-column detail page inside the shell. A `TwoColumnPage` compound layout component (with `.Main` and `.Sidebar` children) provides the page structure. The main column shows a `ProductGeneralSection` with `SectionRow` entries for title, handle, status, and description. An `ActionMenu` component (wrapping `DropdownMenu` from `@proteus/ui` with a discriminated union action type) offers Edit and Delete actions. The `$id/route.tsx` layout route prefetches product data via `ensureQueryData` in its `loader` and injects the product title as a dynamic breadcrumb via `beforeLoad` context. A `pendingComponent` renders a skeleton while the loader runs. The breadcrumb bar shows "Products / Product Title". Delete triggers the mutation and navigates back to the list.

**Blocked by:** 03 — Shell layout with layout groups

**Status:** ready-for-agent

**Reference files to study:**

- Medusa source — product detail page (port structure and components):
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-detail/` — product detail route, loader, constants
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-detail/components/product-general-section/product-general-section.tsx` — general section with title, handle, status, description
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-detail/breadcrumb.tsx` — dynamic breadcrumb pattern
- Medusa source — reusable layout and common components (port these):
  - `medusa-source/packages/admin/dashboard/src/components/layout/pages/two-column-page/two-column-page.tsx` — TwoColumnPage compound component
  - `medusa-source/packages/admin/dashboard/src/components/layout/pages/two-column-page/two-column-layout-component.tsx` — layout implementation
  - `medusa-source/packages/admin/dashboard/src/components/common/action-menu/action-menu.tsx` — ActionMenu with discriminated union actions (links vs handlers)
  - `medusa-source/packages/admin/dashboard/src/components/common/section/section-row.tsx` — SectionRow (label + value grid)

- [ ] `$id/route.tsx` layout route with `loader` calling `queryClient.ensureQueryData(productQueryOptions(params.id))`
- [ ] `$id/route.tsx` `beforeLoad` injects `{ breadcrumb: product.title }` into context for dynamic breadcrumb
- [ ] `$id/route.tsx` `pendingComponent` renders a two-column skeleton matching the detail page layout
- [ ] `$id/index.tsx` renders the detail page using `useSuspenseQuery(productQueryOptions(id))`
- [ ] `TwoColumnPage` compound component with `.Main` and `.Sidebar` children (reusable across domains)
- [ ] `ProductGeneralSection` component in `src/features/products/components/` with section header (title + ActionMenu) and SectionRow entries
- [ ] `SectionRow` component: two-column grid with title (label) and value (text or ReactNode), reusable across domains
- [ ] `ActionMenu` component in `src/components/common/`: wraps `DropdownMenu` from `@proteus/ui`, accepts `groups` prop with discriminated union actions (`{ to, label, icon }` for links, `{ onClick, label, icon }` for handlers), renders groups separated by dividers
- [ ] Edit action navigates to `./edit`
- [ ] Delete action calls `useDeleteProduct` mutation, navigates to `/products` on success
- [ ] Breadcrumb shows "Products / {product.title}" — static "Products" from the products layout route, dynamic title from `beforeLoad` context
- [ ] Page renders correctly when navigated to directly via URL (not just from list)
