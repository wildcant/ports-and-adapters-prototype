# 03 — Admin: Shell layout with layout groups

**What to build:** Navigating to the admin shows a feature-complete shell styled to match Medusa's admin aesthetic. Three pathless layout route groups are wired: `_authed` (placeholder `beforeLoad` that always passes, ready for real auth), `_shell` (renders the shell chrome), and `_public` (minimal layout with a login page stub). The shell includes a collapsible sidebar (`Sidebar` from `@proteus/ui`) with a "Products" navigation link, a topbar, and a breadcrumb bar (`Breadcrumb` from `@proteus/ui`). The breadcrumb system supports both static labels via `staticData` and dynamic labels via `beforeLoad` context. The shell frames a content area via `<Outlet />`.

**Blocked by:** 02 — Admin: App foundation and orval pipeline

**Status:** ready-for-agent

**Reference files to study:**

- Medusa source — shell and navigation (port the structure and styling, use `@proteus/ui` components):
  - `medusa-source/packages/admin/dashboard/src/components/layout/shell/shell.tsx` — Shell component (sidebar + topbar + content area)
  - `medusa-source/packages/admin/dashboard/src/components/layout/main-layout/main-layout.tsx` — main layout wrapper
  - `medusa-source/packages/admin/dashboard/src/components/layout/nav-item/nav-item.tsx` — navigation item with active state
  - `medusa-source/packages/admin/dashboard/src/components/common/sidebar-link/sidebar-link.tsx` — sidebar link component
  - `medusa-source/packages/admin/dashboard/src/providers/sidebar-provider/` — sidebar collapse/expand state management
- Architecture docs:
  - `medusa-source/ADMIN-ARCHITECTURE-TANSTACK.md` — TanStack-adapted architecture patterns (layout groups, breadcrumbs, `staticData`)
- `@proteus/ui` — components to add to the shared package (via `shadcn add` in `packages/ui`), then export and import in admin:
  - Sidebar: https://ui.shadcn.com/docs/components/base/sidebar
  - Breadcrumb: https://ui.shadcn.com/docs/components/base/breadcrumb

- [ ] `_authed/route.tsx` layout route with `beforeLoad` that always passes (placeholder — returns empty context, ready to add `user` and `can()` later)
- [ ] `_shell/route.tsx` layout route renders the Shell component wrapping `<Outlet />`
- [ ] `_public/route.tsx` layout route with minimal chrome
- [ ] `_public/login.tsx` stub page (placeholder text, no real auth)
- [ ] Shell component uses `Sidebar` from `@proteus/ui`: collapsible, "Products" nav link using TanStack Router's `<Link>`, app name/logo area
- [ ] Sidebar highlights the active nav item based on current route
- [ ] Topbar renders above the content area
- [ ] Breadcrumb bar uses `Breadcrumb` from `@proteus/ui`, reads from `useMatches()` collecting `staticData.breadcrumb` and `context.breadcrumb`
- [ ] `StaticDataRouteOption` module declaration extended with `breadcrumb?: string`
- [ ] Products layout route at `_authed/_shell/products/route.tsx` sets `staticData: { breadcrumb: "Products" }`
- [ ] Shell is styled to match Medusa's admin aesthetic: clean, minimal, professional
- [ ] Sidebar collapse/expand persists visually (no need for localStorage persistence in POC)
- [ ] Content area takes remaining viewport height (no scrollbar on the shell itself)
