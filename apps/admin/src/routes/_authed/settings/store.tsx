import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '#/components/layout/page-layout'

export const Route = createFileRoute('/_authed/settings/store')({
  staticData: { breadcrumb: 'Store' },
  component: StorePage,
})

function StorePage() {
  return (
    <PageLayout.SingleColumn>
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Store Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your store settings.</p>
      </div>
    </PageLayout.SingleColumn>
  )
}
