---
date: 2026-08-03T01:22:34Z
researcher: willo
git_commit: b0520082670752ec09b34ea9fac2a1b9422b8cdd
branch: develop
repository: medusajs/medusa
topic: "PageLayout + SettingsLayout spec for Proteus admin"
tags: [spec, page-layout, settings-layout, proteus, admin-dashboard]
status: complete
last_updated: 2026-08-03
last_updated_by: willo
last_updated_note: "Replaced sections prop API with children-based compound components"
---

# Spec: PageLayout + SettingsLayout

**Date**: 2026-08-03
**Target project**: `/Users/willo/learn/medusa/proteus/apps/admin`
**Reference**: Medusa's `LayoutComposer` system (researched in `2026-08-03-layout-composer-system.md`)

## Context

A simplified layout system for the Proteus admin dashboard, borrowing the
predefined page structure pattern from Medusa's `LayoutComposer` while dropping
everything related to runtime customization: no drag-and-drop, no user
preferences, no widget injection, no extension registry.

The result is two components:

1. **`PageLayout`** -- a typed compound component that places page sections into
   a CSS structure. Used by individual page routes.
2. **`SettingsLayout`** -- a route-level layout (sibling to `Shell`) that
   renders a settings-specific sidebar with collapsible nav groups.

---

## 1. `PageLayout`

### What it is

A static, typed layout component. Sections go in, CSS structure comes out,
`<Outlet />` renders at the end for nested modal routes (via TanStack Router
route masking).

No DnD. No preferences. No widgets. No extension system.

### File location

```
src/components/layout/page-layout.tsx
```

### API

Children-based compound components. Content is composed via JSX nesting rather
than a `sections` config prop -- more idiomatic React and consistent with the
shadcn sidebar primitives already used in `Shell`.

```tsx
import { PageLayout } from "#/components/layout/page-layout"

// Single column -- just children
<PageLayout.SingleColumn>
  <GeneralSection />
  <MediaSection />
</PageLayout.SingleColumn>

// Two column -- sub-components for each column
<PageLayout.TwoColumn>
  <PageLayout.TwoColumn.Main>
    <GeneralSection />
    <MediaSection />
  </PageLayout.TwoColumn.Main>
  <PageLayout.TwoColumn.Side>
    <OrganizationSection />
    <AttributeSection />
  </PageLayout.TwoColumn.Side>
</PageLayout.TwoColumn>
```

Every variant accepts an optional `className` prop merged onto the outermost
layout container.

Every variant renders `<Outlet />` (from `@tanstack/react-router`) after the
layout content. This enables nested modal routes via route masking -- the page
author doesn't need to think about it.

### Types

```typescript
import type { ReactNode } from "react"

type LayoutProps = {
  children: ReactNode
  className?: string
}
```

All components (`SingleColumn`, `TwoColumn`, `TwoColumn.Main`, `TwoColumn.Side`)
share the same props shape. Each is a styled wrapper -- no conditional generics,
no slot-finding. `TwoColumn` renders the grid container, `Main` and `Side` are
styled `<div>` wrappers that go inside it.

**Tradeoff vs `sections` prop**: The `sections` prop enforces at the type level
that both `main` and `side` are provided. With compound children, you could
forget `<TwoColumn.Side>` and TypeScript won't catch it. This is the standard
compound component tradeoff (same as `Tabs` without `TabsContent`) and
acceptable for a layout authored once per page.

### CSS structure

#### `PageLayout.SingleColumn`

```tsx
function SingleColumn({ children, className }: LayoutProps) {
  return (
    <>
      <div className={clx("flex flex-col gap-y-3", className)}>
        {children}
      </div>
      <Outlet />
    </>
  )
}
```

Vertical stack with 12px gap between children.

#### `PageLayout.TwoColumn`

```tsx
function TwoColumn({ children, className }: LayoutProps) {
  return (
    <>
      <div className={clx(
        "flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,1fr)_440px]",
        className
      )}>
        {children}
      </div>
      <Outlet />
    </>
  )
}

function Main({ children, className }: LayoutProps) {
  return (
    <div className={clx("flex w-full min-w-0 flex-col gap-y-3", className)}>
      {children}
    </div>
  )
}

function Side({ children, className }: LayoutProps) {
  return (
    <div className={clx("flex w-full flex-col gap-y-3 xl:mt-0", className)}>
      {children}
    </div>
  )
}

TwoColumn.Main = Main
TwoColumn.Side = Side
```

- Below `xl` (1280px): single column, stacked (main then side).
- At `xl`+: two-column grid. Main column is fluid (`minmax(0, 1fr)`), side
  column is fixed 440px.
- `min-w-0` on main prevents content from blowing out the grid track.
- `Main` and `Side` are plain styled `<div>` wrappers -- no slot detection.
  DOM order = visual order.

### Usage examples

#### List page (single column)

```tsx
// routes/_authed/_shell/products/index.tsx
function ProductsPage() {
  return (
    <PageLayout.SingleColumn>
      <ProductListTable />
    </PageLayout.SingleColumn>
  )
}
```

#### Detail page (two column)

```tsx
// routes/_authed/_shell/products/$productId.tsx
function ProductDetailPage() {
  const { product } = Route.useLoaderData()

  return (
    <PageLayout.TwoColumn>
      <PageLayout.TwoColumn.Main>
        <ProductGeneralSection product={product} />
        <ProductMediaSection product={product} />
        <ProductVariantSection product={product} />
      </PageLayout.TwoColumn.Main>
      <PageLayout.TwoColumn.Side>
        <ProductOrganizationSection product={product} />
        <ProductAttributeSection product={product} />
      </PageLayout.TwoColumn.Side>
    </PageLayout.TwoColumn>
  )
}
```

Modals (edit, create) are child routes rendered via the `<Outlet />` that
`PageLayout.TwoColumn` includes. TanStack Router route masking keeps the URL
clean:

```tsx
// router.tsx
const productEditMask = createRouteMask({
  routeTree,
  from: "/products/$productId/edit",
  to: "/products/$productId",
  params: (prev) => ({ productId: prev.productId }),
})
```

### What it does NOT do

- No page title/heading -- page content components handle their own headings
- No back button -- handled by breadcrumbs in the topbar (`Shell`)
- No loading states -- handled by TanStack Router's `pendingComponent` at the
  route level
- No error states -- handled by TanStack Router's `errorComponent` at the route
  level
- No widget injection -- children are exactly what the page passes
- No drag-and-drop reordering
- No user preference persistence

---

## 2. `SettingsLayout`

### What it is

A route-level layout component that replaces the main `Shell` when navigating to
settings pages. Renders a settings-specific sidebar with collapsible nav groups
and an `<Outlet />` for the settings page content.

This is a **sibling** to `Shell`, not nested inside it. Each layout is
self-contained with its own sidebar and content area.

### File location

```
src/components/layout/settings-layout.tsx
```

### Route structure

```
routes/
  _authed/
    _shell/route.tsx            <- Shell (main sidebar: Products, Customers, ...)
      products/
      customers/
      ...
    _settings/route.tsx         <- SettingsLayout (settings sidebar)
      store.tsx
      users.tsx
      regions.tsx
      ...
```

`_shell` and `_settings` are sibling pathless layout routes under `_authed`.
Navigating to `/settings/store` unmounts `Shell` and mounts `SettingsLayout`.

### Sidebar groups

Three fixed collapsible groups (matching Medusa minus Extensions):

| Group | Example items |
|---|---|
| **General** | Store, Users, Regions, Tax Regions, Sales Channels, ... |
| **Developer** | API Keys, Workflows, ... |
| **My Account** | Profile |

Each group is collapsible (expanded by default), separated by dashed dividers.

### API

```tsx
// routes/_authed/_settings/route.tsx
import { SettingsLayout } from "#/components/layout/settings-layout"

export const Route = createFileRoute("/_authed/_settings")({
  component: () => (
    <SettingsLayout
      groups={[
        {
          label: "General",
          items: [
            { label: "Store", to: "/settings/store" },
            { label: "Users", to: "/settings/users" },
            { label: "Regions", to: "/settings/regions" },
          ],
        },
        {
          label: "Developer",
          items: [
            { label: "API Keys", to: "/settings/api-keys" },
            { label: "Workflows", to: "/settings/workflows" },
          ],
        },
        {
          label: "My Account",
          items: [
            { label: "Profile", to: "/settings/profile" },
          ],
        },
      ]}
    />
  ),
})
```

### Types

```typescript
type SettingsNavItem = {
  label: string
  to: string
}

type SettingsNavGroup = {
  label: string
  items: SettingsNavItem[]
}

type SettingsLayoutProps = {
  groups: SettingsNavGroup[]
}
```

### Visual structure

```
+--[ <- Settings ]-------------------------------------------+
|                                                             |
|  +-- sidebar --+  +-- content -------------------------+   |
|  |             |  |                                     |   |
|  | General   - |  |  <Outlet />                         |   |
|  |   Store     |  |  (settings page content,            |   |
|  |   Users     |  |   typically PageLayout.SingleColumn) |   |
|  |   Regions   |  |                                     |   |
|  | ........... |  |                                     |   |
|  | Developer - |  |                                     |   |
|  |   API Keys  |  |                                     |   |
|  |   Workflows |  |                                     |   |
|  | ........... |  |                                     |   |
|  | My Account  |  |                                     |   |
|  |   Profile   |  |                                     |   |
|  |             |  |                                     |   |
|  +-------------+  +-------------------------------------+   |
+-------------------------------------------------------------+
```

The sidebar reuses the same shadcn sidebar primitives as `Shell` (from
`@proteus/ui`) for visual consistency. A back link ("Settings" with back arrow)
at the top navigates back to the main app.

Settings page content (right side) uses `PageLayout.SingleColumn` or
`PageLayout.TwoColumn` as needed.

### What it does NOT do

- No collapsible group state persistence -- all groups start expanded
- No extension/plugin group -- only the 3 fixed groups
- No layout customization -- items are static from the route definition

---

## Decisions log

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Where does this live? | Proteus admin, borrowing Medusa's pattern | Separate project |
| 2 | DnD rearrangement? | No | Not needed |
| 3 | Widget injection? | No | No extension system |
| 4 | Preference persistence? | No | Purely declarative |
| 5 | Layout variants? | 3: SingleColumn, TwoColumn, SettingsLayout | SingleRow only used for topbar in Medusa |
| 6 | Entry wrapper? | No | No stable IDs needed without preferences |
| 7 | Common tail sections helper? | No | Pages are bespoke |
| 8 | `data` prop? | No | No widgets to pass data to |
| 9 | Modal pattern? | TanStack Router `<Outlet />` + route masking | Matches Medusa's nested-route-for-modals pattern |
| 10 | Component name? | `PageLayout` | Descriptive for a static layout picker |
| 11 | Outlet placement? | Inside the layout component | Matches Medusa, convenient |
| 12 | API style? | Children-based compound components (`PageLayout.TwoColumn > .Main + .Side`) | Idiomatic React composition, consistent with shadcn patterns |
| 13 | Settings sidebar? | Separate `SettingsLayout` route layout | Not a page layout -- it's a route-level concern |
| 14 | `className`? | Yes, on all variants | For per-page styling overrides |
| 15 | `hasOutlet` escape hatch? | No, always render `<Outlet />` | Simpler, unused Outlet renders null harmlessly |
| 16 | TwoColumn breakpoint? | `xl` (1280px), 440px sidebar | Same as Medusa |
| 17 | Settings groups? | 3: General, Developer, My Account | No extensions group |
| 20 | Settings layout relation to Shell? | Sibling route layout, not nested | No branching, cleaner |
| 22 | Heading/title/loading/error? | Not in PageLayout | Handled by page content and route config |
| 23 | `sections` prop vs children? | Children-based composition | More idiomatic React, matches shadcn patterns, no config objects |

---

## Related research

- `thoughts/shared/research/2026-08-03-layout-composer-system.md` -- full
  documentation of Medusa's LayoutComposer system that this spec is derived from
