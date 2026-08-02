import { AdminProductListParams } from '@proteus/http-schemas/admin'
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '#/components/data-table'
import { useProductTable } from '#/features/products/hooks/use-product-table'

export const Route = createFileRoute('/_authed/_shell/products/')({
  validateSearch: AdminProductListParams,
  component: ProductsPage,
})

function ProductsPage() {
  const products = useProductTable()

  return (
    <DataTable
      use={products}
      className="flex-1"
      heading="Products"
      actions={[{ label: 'Create Product', to: 'create' }]}
    />
  )
}
