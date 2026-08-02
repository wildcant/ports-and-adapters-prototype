import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/_shell/products')({
  staticData: { breadcrumb: 'Products' },
  component: () => <Outlet />,
})
