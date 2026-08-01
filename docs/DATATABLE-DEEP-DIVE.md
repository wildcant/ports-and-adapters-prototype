# Medusa Admin DataTable — Full Architecture Deep Dive

## Three-Layer Stack

```
+---------------------------------------------------+
|  Route Component (e.g. sales-channel-list)         |  <- composes hooks + renders <DataTable>
+---------------------------------------------------+
|  components/data-table/data-table.tsx              |  <- URL state owner, toolbar layout
+---------------------------------------------------+
|  @medusajs/ui  DataTable + useDataTable            |  <- TanStack Table wrapper, compound UI
+---------------------------------------------------+
```

---

## Layer 1: `@medusajs/ui` Primitives

### `useDataTable(options)`

Creates a TanStack Table instance with `manualSorting`, `manualPagination`, `manualFiltering` — all data operations happen server-side. Returns a `UseDataTableReturn` instance that is the single prop consumed by the compound `<DataTable>` component.

Key behaviors inside the hook:

- **Search debounce**: Local state mirrors `search.state`; changes fire `onSearchChange` only after a 300ms timeout (configurable)
- **Auto page reset**: When enabled (default), any filter/search/sort change resets pagination to page 0 before dispatching
- **Empty state derivation**: `POPULATED` if rows exist, `FILTERED_EMPTY` if search/filters are active, `EMPTY` otherwise
- **State bridging**: TanStack's array-based `SortingState` is mapped to a single `{ id, desc }` object; `ColumnFiltersState` (array of `{id, value}`) is mapped to a flat `{ [id]: value }` record

#### Input: `DataTableOptions<TData>`

Extends TanStack `TableOptions` (picking only `data` and `getRowId`) with:

| Field | Type | Notes |
|---|---|---|
| `columns` | `DataTableColumnDef<TData, any>[]` | required |
| `filters?` | `DataTableFilter[]` | enables filtering features |
| `commands?` | `DataTableCommand[]` | enables command bar |
| `isLoading?` | `boolean` | default `false` |
| `filtering?` | `{ state: DataTableFilteringState; onFilteringChange }` | controlled |
| `rowSelection?` | `{ state, onRowSelectionChange, enableRowSelection? }` | controlled |
| `sorting?` | `{ state: DataTableSortingState \| null; onSortingChange }` | controlled |
| `search?` | `{ state: string; onSearchChange; debounce?: number }` | default debounce 300ms |
| `pagination?` | `{ state: DataTablePaginationState; onPaginationChange }` | controlled |
| `onRowClick?` | `(event, row: TData) => void` | |
| `rowCount?` | `number` | default 0, for server-side total |
| `autoResetPageIndex?` | `boolean` | default `true` |
| `columnVisibility?` | `{ state: VisibilityState; onColumnVisibilityChange }` | controlled |
| `columnOrder?` | `{ state: ColumnOrderState; onColumnOrderChange }` | controlled |

#### Return Value: `UseDataTableReturn<TData>`

**TanStack Table delegates:**
- `getHeaderGroups`, `getRowModel`, `getAllColumns`, `getCanNextPage`, `getCanPreviousPage`, `nextPage`, `previousPage`, `getPageCount`, `setColumnVisibility`, `setColumnOrder`

**DataTable-specific methods:**
- `getSorting()` — returns current sort or `null`
- `setSorting(sortingOrUpdater)` — resets page index, calls `instance.setSorting`
- `getFilters()` — returns the `filters` array
- `getFilterOptions(id)` — returns options for a specific filter
- `getFilterMeta(id)` — returns the full `DataTableFilter` object
- `getFiltering()` — reads current filtering state as flat object
- `addFilter({ id, value })` — merges into current state
- `removeFilter(id)` — deletes from state
- `clearFilters()` — resets all filters
- `updateFilter({ id, value })` — alias for `addFilter`
- `getSearch()` — returns local debounced search string
- `onSearchChange(search)` — sets local state, fires debounced callback
- `getCommands()` — returns `commands ?? []`
- `getRowSelection()` — reads current row selection state

**Computed values:**
- `emptyState`, `isLoading`, `showSkeleton`
- `pageIndex`, `pageSize`, `rowCount`
- `enablePagination`, `enableFiltering`, `enableSorting`, `enableSearch`, `enableColumnVisibility`, `enableColumnOrder`

### Compound Components

All read from `DataTableContext` (set by root `<DataTable instance={...}>`):

| Component | Role |
|---|---|
| `DataTable.Toolbar` | Two-row container: top = children (search/menus/actions), bottom = `FilterBar` |
| `DataTable.Search` | `<Input>` bound to `instance.getSearch()` / `instance.onSearchChange()` |
| `DataTable.FilterMenu` | Dropdown listing filters *not yet active*; clicking adds with type-appropriate default |
| `DataTable.FilterBar` | Renders filter pills; maintains `localFilters` synced via `useEffect` + `lodash.isEqual` |
| `DataTable.SortingMenu` | Two radio groups: pick column, pick direction; reads `meta.___sortMetaData` for labels |
| `DataTable.ColumnVisibilityMenu` | Per-column checkboxes + "Toggle all"; reads `meta.name` for labels |
| `DataTable.Table` | Renders `<table>` with sticky select/first columns, DnD column reordering, keyboard row selection (`x` key), empty state display |
| `DataTable.Pagination` | Page controls reading `instance.pageIndex/pageSize/rowCount` |
| `DataTable.CommandBar` | Floating bar when `commands.length > 0 && selectedCount > 0`; fires `command.action(rowSelection)` |

### Seven Filter Types

| Type | Value Shape | UI |
|---|---|---|
| `radio` | `string` | Single-select list |
| `select` | `string[]` | Checkbox list |
| `multiselect` | `string[]` | Checkbox list + optional search |
| `date` | `DataTableDateComparisonOperator` (`$gte/$lte/$gt/$lt`) | Preset options + optional range picker |
| `string` | `string` | Text input (500ms debounce) |
| `number` | `number \| DataTableNumberComparisonOperator` | Optional operator select + number input |
| `custom` | `any` | `render({ value, onChange, onRemove })` |

### Type-Safe Builders

- `createDataTableColumnHelper<TData>()` — wraps TanStack's `createColumnHelper`, adds `.select()`, `.action()`, metadata packing
- `createDataTableFilterHelper<TData>()` — returns `{ accessor(key, props), custom(props) }` with `DeepKeys<TData>` type safety
- `createDataTableCommandHelper()` — returns `{ command(cmd) }` identity wrapper for type checking

### Context System

```
DataTable (root) renders DataTableContextProvider
  -> provides { instance, enableColumnVisibility, enableColumnOrder }
  -> all compound sub-components call useDataTableContext() to access instance
```

---

## Layer 2: `components/data-table/data-table.tsx` — The URL-Stateful Wrapper

This is the component route pages actually import. It owns **all** URL state and bridges it to `useDataTable`.

### URL State Flow

```
Browser URL  --useSearchParams()-->  useQueryParams(keys, prefix)
                                         |
                    +--------------------+--------------------+
                    v                    v                    v
              offset -> parse        order -> parse        q -> memo
              +--------------+   +----------------+    +----------+
              | pageIndex =  |   | startsWith("-")|    | q ?? ""  |
              | offset/size  |   | -> {id, desc}  |    +----------+
              +--------------+   +----------------+
                    |                    |                    |
                    v                    v                    v
              useDataTable({ pagination, sorting, search, filtering })
                    |
              user interaction (click page / sort / filter / type)
                    |
              handleXxxChange  --setSearchParams()-->  Browser URL updated
                    |                                        |
                    +---- URL change triggers re-render -----+
```

### URL Encoding Conventions

**Pagination**: URL stores `offset` as `pageIndex * pageSize`. Page 0 deletes the key entirely.

```typescript
// Parse: "40" with pageSize=20 -> { pageIndex: 2, pageSize: 20 }
function parsePaginationState(value: string, pageSize: number) {
  const offset = parseInt(value)
  return { pageIndex: Math.floor(offset / pageSize), pageSize }
}

// Write: { pageIndex: 2, pageSize: 20 } -> 40
function transformPaginationState(value: DataTablePaginationState) {
  return value.pageIndex * value.pageSize
}
```

**Sorting**: URL stores `fieldName` (asc) or `-fieldName` (desc). `null` deletes the key.

```typescript
// Parse: "-title" -> { id: "title", desc: true }
function parseSortingState(value: string) {
  return value.startsWith("-")
    ? { id: value.slice(1), desc: true }
    : { id: value, desc: false }
}
```

**Search**: URL stores `q=value`. Empty string deletes the key.

**Filtering**: Each filter is a separate URL key storing `JSON.stringify(value)`. Special boolean guard: `JSON.parse("false")` returns the raw string `"false"` instead of boolean `false`, so radio filters with string option values match correctly.

### Prefix Namespacing

The `prefix` prop namespaces every URL key as `{prefix}_{key}`. Both reads (`useQueryParams`) and writes (`getQueryParamKey`) apply it symmetrically. This allows multiple independent tables on one page:

```
?sc_offset=20&sc_q=retail&pv_offset=10&pv_order=-title
 ^ sales channels table      ^ product variants table
```

### `useQueryParams` Hook

```typescript
// hooks/use-query-params.tsx
function useQueryParams<T extends string>(
  keys: T[],
  prefix?: string
): { [key in T]: string | undefined }
```

- Reads `useSearchParams()` from React Router
- Applies prefix: looks up `{prefix}_{key}` in URL, returns under unprefixed key
- All values are `string | undefined` — no runtime coercion
- Re-renders on any URL change via React Router

### Props Interface

```typescript
interface DataTableProps<TData> {
  data?: TData[]
  columns: DataTableColumnDef<TData, any>[]
  filters?: DataTableFilter[]
  commands?: DataTableCommand[]
  action?: DataTableActionProps           // single button (link or onClick)
  actions?: DataTableActionProps[]        // multiple buttons
  actionMenu?: DataTableActionMenuProps   // overflow ActionMenu in toolbar
  rowCount?: number
  getRowId: (row: TData) => string
  enablePagination?: boolean              // default true
  enableSearch?: boolean                  // default true
  autoFocusSearch?: boolean
  rowHref?: (row: TData) => string        // makes rows clickable
  emptyState?: DataTableEmptyStateProps
  heading?: string
  headingLevel?: "h1" | "h2" | "h3"
  subHeading?: string
  prefix?: string                         // namespaces URL params
  pageSize?: number                       // default 10
  isLoading?: boolean
  rowSelection?: {
    state: DataTableRowSelectionState
    onRowSelectionChange: (value: DataTableRowSelectionState) => void
    enableRowSelection?: boolean | ((row: DataTableRow<TData>) => boolean)
  }
  layout?: "fill" | "auto"
  enableColumnVisibility?: boolean
  initialColumnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (order: ColumnOrderState) => void
  enableViewSelector?: boolean
  entity?: string
  currentColumns?: { visible: string[]; order: string[] }
  filterBarContent?: React.ReactNode
}
```

### Toolbar Action Props

| Prop | Renders | Position |
|---|---|---|
| `action` | Single button (link or onClick) | Toolbar, rightmost |
| `actions` | Multiple buttons | Toolbar, rightmost |
| `actionMenu` | Overflow kebab menu | Toolbar, before action buttons |

### Feature-Flagged Column Visibility

The `view_configurations` feature flag gates `enableColumnVisibility` and `enableViewSelector`. When off, both are forced `false` regardless of props.

---

## Layer 3: Route-Level Composition

Every table page assembles four hooks + renders `<DataTable>`:

```
useXxxTableQuery(prefix, pageSize)     -> API params from URL
useXxxTableColumns()                   -> DataTableColumnDef[]
useXxxTableFilters()                   -> DataTableFilter[]
useXxxTableEmptyState()                -> DataTableEmptyStateProps

useTanStackQuery(apiParams)            -> { data, count, isPending }

<DataTable
  data={data}
  columns={columns}
  filters={filters}
  emptyState={emptyState}
  rowCount={count}
  isLoading={isPending}
  getRowId={(row) => row.id}
  ...
/>
```

### Query Hook Pattern

Reads URL params, transforms to typed API params:

```typescript
const useSalesChannelTableQuery = ({ prefix, pageSize }) => {
  const { offset, q, order, created_at, updated_at, is_disabled } =
    useQueryParams(
      ["offset", "q", "order", "created_at", "updated_at", "is_disabled"],
      prefix
    )

  return {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    q, order,
    created_at: created_at ? JSON.parse(created_at) : undefined,
    is_disabled: is_disabled ? JSON.parse(is_disabled) : undefined,
  }
}
```

The same `prefix` is passed to both the query hook and `<DataTable prefix={...}>`, ensuring they read/write the same URL keys.

### Column Hook Pattern

Uses `createDataTableColumnHelper<TEntity>()` for type-safe accessor columns:

```typescript
const columnHelper = createDataTableColumnHelper<HttpTypes.AdminSalesChannel>()

const useColumns = () => {
  const dateColumns = useDataTableDateColumns<HttpTypes.AdminSalesChannel>()
  return useMemo(() => [
    columnHelper.accessor("name", {
      header: t("fields.name"),
      enableSorting: true,
      sortLabel: t("fields.name"),
    }),
    columnHelper.accessor("is_disabled", {
      header: t("fields.status"),
      cell: ({ getValue }) => (
        <DataTableStatusCell color={getValue() ? "grey" : "green"}>
          {getValue() ? t("general.disabled") : t("general.enabled")}
        </DataTableStatusCell>
      ),
    }),
    ...dateColumns,
    columnHelper.action({ actions: (ctx) => [[...]] }),
  ], [dateColumns, t])
}
```

Special column types:
- **`columnHelper.select()`** — renders checkboxes, enables row selection
- **`columnHelper.action({ actions })`** — renders kebab overflow menu per row; `actions` can be a static array or a function `(ctx) => DataTableAction[][]`
- **`columnHelper.display({ id, cell })`** — arbitrary render (e.g. dynamic option columns)

### Filter Hook Pattern

Uses `createDataTableFilterHelper<TEntity>()`:

```typescript
const filterHelper = createDataTableFilterHelper<HttpTypes.AdminProductVariant>()

const useFilters = () => {
  const dateFilters = useDataTableDateFilters()
  return useMemo(() => [
    filterHelper.accessor("allow_backorder", {
      type: "radio",
      label: t("fields.allowBackorder"),
      options: [
        { label: t("filters.radio.yes"), value: "true" },
        { label: t("filters.radio.no"), value: "false" },
      ],
    }),
    ...dateFilters,
  ], [t, dateFilters])
}
```

The filter `id` must match the URL key and the API param name — this is the contract that ties the three layers together.

---

## Shared Reusable Helpers

Located in `components/data-table/helpers/`:

| Hook | Returns | Reused by |
|---|---|---|
| `useDataTableDateColumns<T>()` | `created_at` + `updated_at` columns with tooltip + sorting | Any entity with timestamps |
| `useDataTableDateFilters()` | `created_at` + `updated_at` date filters with 5 presets (today, 7d, 30d, 90d, 12mo) + custom range | Any entity with timestamps |
| `useSalesChannelTable{Columns,Filters,Query,EmptyState}()` | Full sales channel table config | Sales channel list, API key detail, API key form |

The sales channel helpers are the model for creating domain-specific shared helper sets when a table is reused across multiple routes.

---

## Advanced Patterns

### Row Selection + Commands

```typescript
const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})

<DataTable
  columns={[columnHelper.select(), ...columns, columnHelper.action(...)]}
  rowSelection={{
    state: rowSelection,
    onRowSelectionChange: setRowSelection,
  }}
  commands={[
    commandHelper.command({
      label: "Remove",
      shortcut: "r",
      action: async (selection) => {
        await removeMutation(Object.keys(selection))
        setRowSelection({})
      },
    }),
  ]}
/>
```

The `CommandBar` appears when `commands.length > 0` and at least one row is selected. `action` receives the full `{ [rowId]: true }` state.

### Guarded Row Selection (Pre-selected Rows)

```typescript
rowSelection={{
  state: rowSelection,
  onRowSelectionChange: updater,
  enableRowSelection: (row) => !preSelected.includes(row.id),
}}
```

Disabled rows render a grayed-out checkbox with a tooltip. `row.getCanSelect()` returns `false` for those rows.

### Row Selection Wired to React Hook Form

```typescript
const updater = (selection: DataTableRowSelectionState) => {
  setValue("sales_channel_ids", Object.keys(selection), { shouldDirty: true })
  setRowSelection(selection)
}
```

### Dynamic Columns (e.g. Product Options)

```typescript
const optionColumns = useMemo(() => {
  return product.options.map((option) =>
    columnHelper.display({
      id: option.id,
      header: option.title,
      cell: ({ row }) => (
        <Badge>
          {row.original.options?.find((o) => o.option_id === option.id)?.value}
        </Badge>
      ),
    })
  )
}, [product])
```

### Toolbar Action Menu (Kebab in Header)

```typescript
<DataTable
  actionMenu={{
    groups: [{
      actions: [
        { label: "Edit Prices", to: "prices", icon: <PencilSquare /> },
        { label: "Manage Stock", to: "stock", icon: <Buildings /> },
      ],
    }],
  }}
/>
```

---

## Why Three Layers?

Each layer exists because it solves a different problem, and collapsing any two would create a worse tradeoff.

### Layer 1: `@medusajs/ui` — Headless UI primitives

A **published design system package** used by Medusa's admin and third-party developers. Must be:
- Framework-agnostic regarding routing, URL state, and data fetching
- Stateless regarding where state lives (URL, React state, form state)
- Composable via compound components

If this layer knew about URL params or Medusa's API, it couldn't be a general-purpose design system component.

### Layer 2: `components/data-table/` — URL-stateful wrapper

**Medusa admin's internal convention** for how tables behave:
- State lives in URL search params (bookmarkable, shareable, back-button-friendly)
- Prefix namespacing for multiple tables per page
- Offset-based pagination matching Medusa's API
- Feature flags gate column visibility

If merged into Layer 1, the design system would be coupled to React Router and admin-specific feature flags. If merged into Layer 3, every route would duplicate ~200 lines of URL parsing.

### Layer 3: Route components — Domain-specific composition

Each route knows things the other layers can't:
- Which entity is being listed and what API to call
- Which columns to show (including dynamic ones)
- Which filters apply to this entity's API params
- How to transform URL strings into typed API params
- What actions are available (create buttons, row menus, bulk commands)

| Layer | Owns | Can't know about |
|---|---|---|
| `@medusajs/ui` | Visual rendering, TanStack Table abstraction | URL shape, routing, APIs, Medusa conventions |
| `data-table.tsx` | URL <-> state sync, encoding conventions | Entity types, API params, business actions |
| Route component | Domain columns/filters/queries/actions | How to render a table or manage URL state |

---

## The Complete Data Cycle

```
1. User loads /admin/sales-channels
   URL: ?q=retail&order=-name&offset=20&is_disabled=false

2. useQueryParams(["q","order","offset","is_disabled","created_at","updated_at"])
   -> { q: "retail", order: "-name", offset: "20", is_disabled: "false" }

3. useSalesChannelTableQuery({ pageSize: 20 })
   -> { q: "retail", order: "-name", offset: 20, limit: 20, is_disabled: false }

4. useSalesChannels(params) -> TanStack Query -> GET /admin/sales-channels?...
   -> { sales_channels: [...], count: 45 }

5. DataTable receives data, parses URL state into typed objects:
   pagination: { pageIndex: 1, pageSize: 20 }
   sorting:    { id: "name", desc: true }
   search:     "retail"
   filtering:  { is_disabled: "false" }

6. useDataTable() creates TanStack Table instance with all state

7. Compound UI components render from context:
   Search input shows "retail"
   SortingMenu shows "Name" selected, "Z-A" active
   FilterBar shows "Status: Enabled" chip
   Table shows rows 21-40
   Pagination shows "Page 2 of 3"

8. User clicks "Next Page" ->
   handlePaginationChange({ pageIndex: 2, pageSize: 20 })
   -> setSearchParams: offset=40
   -> URL updates -> cycle restarts at step 2
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/design-system/ui/src/blocks/data-table/types.ts` | All exported types |
| `packages/design-system/ui/src/blocks/data-table/use-data-table.tsx` | Hook, TanStack instantiation, state transformers |
| `packages/design-system/ui/src/blocks/data-table/data-table.tsx` | Root compound component assembly |
| `packages/design-system/ui/src/blocks/data-table/context/` | Context provider and consumer hook |
| `packages/design-system/ui/src/blocks/data-table/components/data-table-table.tsx` | Table renderer, DnD, sticky columns, empty state |
| `packages/design-system/ui/src/blocks/data-table/components/data-table-filter-bar.tsx` | Local filter state layer |
| `packages/design-system/ui/src/blocks/data-table/components/data-table-filter.tsx` | Filter pill + all filter type UIs |
| `packages/design-system/ui/src/blocks/data-table/utils/create-data-table-column-helper.tsx` | Column def builder |
| `packages/admin/dashboard/src/components/data-table/data-table.tsx` | URL-stateful wrapper |
| `packages/admin/dashboard/src/hooks/use-query-params.tsx` | URL param reader with prefix support |
| `packages/admin/dashboard/src/components/data-table/helpers/general/use-data-table-date-columns.tsx` | Shared date columns |
| `packages/admin/dashboard/src/components/data-table/helpers/general/use-data-table-date-filters.tsx` | Shared date filters |
| `packages/admin/dashboard/src/components/data-table/helpers/sales-channels/` | Full shared sales channel table config |
| `packages/admin/dashboard/src/components/data-table/components/data-table-status-cell/` | Status indicator cell component |
