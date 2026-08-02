import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    // TODO(Auth): Placeholder — always passes. Add real auth check here later:
    // const user = await context.queryClient.ensureQueryData(meQueryOptions())
    // if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
    // return { user }
  },
  component: () => <Outlet />,
})
