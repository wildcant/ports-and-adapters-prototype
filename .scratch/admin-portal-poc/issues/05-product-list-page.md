# 05 — Admin: Product list page

**What to build:** Navigating to `/products` inside the shell shows a fully functional product list table powered by real backend data. The route defines a `validateSearch` Zod schema handling all URL state (q, offset, order, status, created_at). Domain-specific hooks compose the DataTable: `useProductTableColumns` defines title, handle, status (rendered as a badge), and created_at columns with sorting; `useProductTableFilters` defines status (select filter with draft/published/proposed/rejected options) and created_at (date range filter). The toolbar includes a search input and a "Create Product" action button. Each row has a per-row action menu (kebab) with edit and delete options. Clicking a row navigates to the product detail page. The breadcrumb shows "Products". Data comes from the real backend API via the generated client and React Query hooks.

**Blocked by:** 03 — Shell layout with layout groups, 04 — DataTable system

**Status:** ready-for-agent

**Reference files to study:**

- Medusa source — product list page (port the structure and patterns):
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-list/product-list.tsx` — product list route component
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-list/components/product-list-table/product-list-table.tsx` — product list table wiring
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-list/components/product-list-table/product-list-table-actions.tsx` — per-row actions
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-list/components/product-list-table/use-product-table-filters.tsx` — product-specific filters
  - `medusa-source/packages/admin/dashboard/src/hooks/table/columns/use-product-table-columns.tsx` — product column definitions
  - `medusa-source/packages/admin/dashboard/src/hooks/table/filters/use-product-table-filters.tsx` — product filter definitions (older location)
  - `medusa-source/packages/admin/dashboard/src/routes/products/product-list/loader.ts` — route loader

- [ ] Route at `_authed/_shell/products/index.tsx` with `validateSearch` using Zod schema and `@tanstack/zod-adapter`'s `fallback()` for defaults
- [ ] Search schema includes: `q` (optional string), `offset` (number, default 0), `order` (optional string), `status` (optional string array), `created_at` (optional object with `$gte`/`$lte`)
- [ ] `ProductListTable` component in `src/features/products/components/` wires `useProducts()` query hook with search params from `Route.useSearch()`
- [ ] `useProductTableColumns` hook in `src/features/products/hooks/` returns column definitions: title (text), handle (text), status (badge with color per status), created_at (formatted date) plus date columns from shared helper, plus action column
- [ ] `useProductTableFilters` hook in `src/features/products/hooks/` returns: status select filter (multiple, options: draft/published/proposed/rejected) plus date filters from shared helper
- [ ] Per-row action menu with "Edit" (navigates to `./[id]/edit`) and "Delete" (calls `useDeleteProduct` mutation) actions
- [ ] "Create Product" action button in toolbar navigates to `./create`
- [ ] Clicking a row navigates to `/products/$id`
- [ ] Table shows loading skeleton via `isLoading` prop while data fetches
- [ ] Empty state shown when no products exist
- [ ] Filtered-empty state shown when filters produce no results
- [ ] Pagination, search, filters, and sorting all round-trip through the URL and produce correct API calls
