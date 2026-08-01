# 04 — Admin: DataTable system

**What to build:** A reusable, URL-driven DataTable component system built on `@proteus/ui` components, inspired by Medusa's three-layer DataTable architecture. Layer 1: `useDataTable` hook wrapping TanStack Table with manual sorting/pagination/filtering, state bridging between TanStack Table internals and flat app-level state, search debounce, auto page reset on filter/sort/search changes, and empty state derivation (POPULATED / FILTERED_EMPTY / EMPTY). Compound components: `DataTable` root, `DataTable.Toolbar`, `DataTable.Search`, `DataTable.FilterMenu`, `DataTable.FilterBar`, `DataTable.SortingMenu`, `DataTable.Table`, `DataTable.Pagination`. Layer 2: URL state management coupled to TanStack Router — reads `Route.useSearch()` and writes via `navigate({ search })`, handles parsing/serializing pagination (offset to pageIndex), sorting (`-field` for desc), search (`q`), and filtering (JSON stringified values), with prefix namespacing for multi-table pages. Type-safe builders: `createDataTableColumnHelper<T>()` adding `.action()` for per-row kebab menus, `createDataTableFilterHelper<T>()` with `DeepKeys<T>` type safety. Three filter types: select (multi-select checkbox list), date (presets + custom range), radio (single-select). Shared reusable helpers: `useDataTableDateColumns<T>()` and `useDataTableDateFilters()`. Verifiable by rendering a DataTable with hardcoded mock data on a test route.

**Blocked by:** 02 — Admin: App foundation and orval pipeline

**Status:** ready-for-agent

**Reference files to study:**

- Architecture docs (read these first):
  - `medusa-source/DATATABLE-DEEP-DIVE.md` — comprehensive breakdown of Medusa's three-layer DataTable architecture
  - `medusa-source/MVP-TABLES.md` — simplified scope decisions for the POC
  - `medusa-source/ADMIN-ARCHITECTURE-TANSTACK.md` — how DataTable integrates with TanStack Router URL state
- Medusa source — Layer 1: `useDataTable` hook and compound components (port structure, swap Radix for `@proteus/ui` components):
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/use-data-table.tsx` — core hook (state bridging, debounce, pagination, empty state)
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/data-table.tsx` — compound component root
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-toolbar.tsx` — toolbar layout
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-search.tsx` — search input
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-filter.tsx` — filter rendering
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-filter-menu.tsx` — filter picker menu
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-filter-bar.tsx` — active filter chips
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-sorting-menu.tsx` — sort column/direction picker
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-table.tsx` — table rendering
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/components/data-table-pagination.tsx` — pagination controls
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/context/` — DataTable context provider
- Medusa source — type-safe builders:
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/utils/create-data-table-column-helper.tsx` — column helper with `.action()` extension
  - `medusa-source/packages/design-system/ui/src/blocks/data-table/utils/create-data-table-filter-helper.ts` — filter helper with `DeepKeys<T>`
- Medusa source — Layer 2: dashboard-level DataTable wrapper with URL state:
  - `medusa-source/packages/admin/dashboard/src/components/data-table/data-table.tsx` — URL-coupled wrapper
  - `medusa-source/packages/admin/dashboard/src/hooks/use-data-table.tsx` — dashboard useDataTable hook
  - `medusa-source/packages/admin/dashboard/src/lib/table/filter-utils.ts` — filter parsing utilities
- Medusa source — shared helpers:
  - `medusa-source/packages/admin/dashboard/src/components/data-table/helpers/general/use-data-table-date-columns.tsx`
  - `medusa-source/packages/admin/dashboard/src/components/data-table/helpers/general/use-data-table-date-filters.tsx`

- [ ] `useDataTable` hook creates a TanStack Table instance with `manualSorting`, `manualPagination`, `manualFiltering`
- [ ] State bridging: TanStack Table's `SortingState` (array) mapped to single `{ id, desc }` object; `ColumnFiltersState` mapped to flat `{ [id]: value }` record
- [ ] Search debounce: local state mirrors search, fires `onSearchChange` after configurable timeout (default 300ms)
- [ ] Auto page reset: filter/search/sort changes reset pagination to page 0
- [ ] Empty state derivation: `POPULATED` if rows exist, `FILTERED_EMPTY` if search/filters active, `EMPTY` otherwise
- [ ] `DataTable` root component provides context to all compound children
- [ ] `DataTable.Toolbar` renders search, filter menu, sorting menu, and optional action slots
- [ ] `DataTable.Search` bound to `useDataTable`'s search state with debounce
- [ ] `DataTable.FilterMenu` lists available filters not yet active; clicking one adds it with a type-appropriate default
- [ ] `DataTable.FilterBar` renders active filter chips with remove capability
- [ ] `DataTable.SortingMenu` allows picking sort column and direction
- [ ] `DataTable.Table` renders `<table>` with headers and rows from TanStack Table instance
- [ ] `DataTable.Pagination` shows page controls with page index, page count, and row count
- [ ] URL state: pagination stored as `offset` (pageIndex * pageSize), sorting as `field` or `-field`, search as `q`, filters as JSON-stringified values per filter key
- [ ] Prefix namespacing: all URL keys can be prefixed as `{prefix}_{key}`
- [ ] `createDataTableColumnHelper<T>()` wraps TanStack's `createColumnHelper`, adds `.action({ actions })` for per-row kebab menu rendering
- [ ] `createDataTableFilterHelper<T>()` returns `.accessor(key, props)` with `DeepKeys<T>` type safety
- [ ] Select filter: multi-select checkbox list in a popover, stores comma-separated values or JSON array
- [ ] Date filter: preset options (Today, Last 7/30/90 days, Last 12 months) plus custom date range, stores `{ $gte, $lte }` as JSON
- [ ] Radio filter: single-select list, stores raw string value
- [ ] `useDataTableDateColumns<T>()` returns `created_at` and `updated_at` columns with sorting enabled
- [ ] `useDataTableDateFilters()` returns `created_at` and `updated_at` date filters with standard presets
- [ ] DataTable renders correctly with mock data on a test route (pagination, sorting, search, filtering all functional via URL)
