# 06 — Admin: Product detail page

**What to build:** Navigating to `/products/:id` shows a two-column detail page inside the shell using the existing `PageLayout.TwoColumn` component. The main column shows a `ProductGeneralSection` with `SectionRow` entries for title, handle, status, and description. An `ActionMenu` component (wrapping `DropdownMenu` from `@proteus/ui` with a discriminated union action type) offers Edit and Delete actions. The `$id/route.tsx` layout route prefetches product data via `ensureQueryData` in its `loader` and injects the product title as a dynamic breadcrumb via `beforeLoad` context. A `pendingComponent` renders a skeleton while the loader runs. The breadcrumb bar shows "Products / Product Title". Delete triggers the mutation and navigates back to the list.

**Blocked by:** 03 — Shell layout with layout groups

**Status:** done

**Reference files to study:**

- Medusa source — product detail page (port structure and components):
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-detail/` — product detail route, loader, constants
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-detail/components/product-general-section/product-general-section.tsx` — general section with title, handle, status, description
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-detail/breadcrumb.tsx` — dynamic breadcrumb pattern
- Medusa source — reusable skeleton components (port all):
  - `medusa-source/packages/admin/dashboard/src/components/common/skeleton/skeleton.tsx` — Skeleton, HeadingSkeleton, TextSkeleton, IconButtonSkeleton, GeneralSectionSkeleton, TableFooterSkeleton, TableSkeleton, TableSectionSkeleton, JsonViewSectionSkeleton, SingleColumnPageSkeleton, TwoColumnPageSkeleton
- Medusa source — reusable common components (port these):
  - `medusa-source/packages/admin/dashboard/src/components/common/action-menu/action-menu.tsx` — ActionMenu with discriminated union actions (links vs handlers)
  - `medusa-source/packages/admin/dashboard/src/components/common/section/section-row.tsx` — SectionRow (label + value grid)

## Existing building blocks (already done)

- [x] `PageLayout.TwoColumn` compound component with `.Main` and `.Side` children — `src/components/layout/page-layout/`
- [x] `PageLayout.SingleColumn` — `src/components/layout/page-layout/`
- [x] Product API hooks (`useProduct`, `useDeleteProduct`, `productQueryOptions`) — `src/features/products/api/products.ts`
- [x] Shell layout with sidebar, breadcrumbs, topbar
- [x] `DropdownMenu`, `Badge`, `Card`, `Skeleton` primitives in `@proteus/ui`

## Skeleton components (`src/components/common/skeleton/`)

Port from Medusa's `skeleton.tsx`. These are reusable across all detail/list pages.

- [x] `SkeletonBlock` — base animated placeholder (thin wrapper over `@proteus/ui` `Skeleton` adding default size)
- [x] `HeadingSkeleton` — sized by heading level (`h1`/`h2`/`h3`) and character count
- [x] `TextSkeleton` — sized by text size (`small`/`base`/`large`/etc.) and character count
- [x] `IconButtonSkeleton` — fixed 28x28 rounded square
- [x] `GeneralSectionSkeleton` — card with heading + icon button + N rows (mirrors `SectionRow` layout)
- [x] `TableFooterSkeleton` — pagination placeholder
- [x] `TableSkeleton` — toolbar + rows + footer (configurable row count, search, filters, pagination)
- [x] `TableSectionSkeleton` — card with heading + `TableSkeleton`
- [x] `JsonViewSectionSkeleton` — card with heading + badge + icon button
- [x] `SingleColumnPageSkeleton` — N section-sized blocks stacked vertically
- [x] `TwoColumnPageSkeleton` — main + sidebar skeleton blocks matching `PageLayout.TwoColumn` grid

## Reusable common components

- [x] `ActionMenu` in `src/components/common/action-menu.tsx`: wraps `DropdownMenu` from `@proteus/ui`, accepts `groups` prop with discriminated union actions (`{ to, label, icon }` for links, `{ onClick, label, icon }` for handlers), renders groups separated by dividers. Uses TanStack Router `<Link>` instead of react-router.
- [x] `SectionRow` in `src/components/common/section-row.tsx`: two-column grid with title (label) and value (text or ReactNode), reusable across domains

## Product detail route

- [x] `$id/route.tsx` `beforeLoad` fetches via `queryClient.ensureQueryData(productQueryOptions(params.id))` and injects `{ breadcrumb: product.title }` into context
- [x] `$id/route.tsx` `pendingComponent` renders `TwoColumnPageSkeleton` while loading
- [x] `$id/index.tsx` renders the detail page using `useSuspenseQuery(productQueryOptions(id))`
- [x] `$id/index.tsx` uses `PageLayout.TwoColumn` with `.Main` and `.Side`

## Domain component

- [x] `ProductGeneralSection` in `src/features/products/components/`: card with section header (title + status badge + `ActionMenu`) and `SectionRow` entries for description, subtitle, handle, material, discountable

## Behavior

- [x] Edit action in ActionMenu navigates to `./edit`
- [x] Delete action calls `useDeleteProduct` mutation, navigates to `/products` on success
- [x] Breadcrumb shows "Products / {product.title}" — static "Products" from the products layout route, dynamic title from `beforeLoad` context
- [x] Page renders correctly when navigated to directly via URL (not just from list)
