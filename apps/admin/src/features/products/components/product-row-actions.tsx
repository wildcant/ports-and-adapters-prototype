import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@proteus/ui'
import { EllipsisIcon } from 'lucide-react'
import type { AdminProduct } from '#/api/generated/model'
import { useDeleteProduct } from '#/features/products/api/products'

export function ProductRowActions({ product }: { product: AdminProduct }) {
  const { mutate: deleteProduct } = useDeleteProduct(product.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            /* TODO: navigate to edit */
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => deleteProduct()}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
