import { createFileRoute, Outlet } from '@tanstack/react-router'
import { TwoColumnPageSkeleton } from '#/components/common/skeleton'
import { productQueryOptions } from '#/features/products/api/products'

export const Route = createFileRoute('/_authed/_shell/products/$id')({
  beforeLoad: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQueryOptions(params.id))
    return { breadcrumb: data.product.title }
  },
  pendingComponent: () => <TwoColumnPageSkeleton mainSections={1} sidebarSections={1} />,
  component: () => <Outlet />,
})
