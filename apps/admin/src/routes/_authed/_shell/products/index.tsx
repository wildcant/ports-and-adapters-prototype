import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/_shell/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your product catalog.</p>
    </div>
  )
}
