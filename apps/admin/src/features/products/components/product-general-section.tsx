import { Badge, Card, CardAction, CardHeader, CardTitle } from '@proteus/ui'
import { useNavigate } from '@tanstack/react-router'
import { PencilIcon, TrashIcon } from 'lucide-react'
import type { AdminProduct } from '#/api/generated/model'
import { ActionMenu } from '#/components/common/action-menu'
import { SectionRow } from '#/components/common/section-row'
import { useDeleteProduct } from '#/features/products/api/products'

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  published: 'default',
  draft: 'secondary',
  proposed: 'outline',
  rejected: 'destructive',
}

export function ProductGeneralSection({ product }: { product: AdminProduct }) {
  const navigate = useNavigate()
  const { mutateAsync: deleteProduct } = useDeleteProduct(product.id)

  const handleDelete = async () => {
    await deleteProduct(undefined, {
      onSuccess: () => navigate({ to: '/products' }),
    })
  }

  return (
    <Card className="divide-y gap-0 py-0">
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
        <CardAction className="flex items-center gap-x-3">
          <Badge variant={statusVariants[product.status] ?? 'secondary'}>{product.status}</Badge>
          <ActionMenu
            groups={[
              { actions: [{ label: 'Edit', to: './edit', icon: <PencilIcon /> }] },
              { actions: [{ label: 'Delete', onClick: handleDelete, icon: <TrashIcon /> }] },
            ]}
          />
        </CardAction>
      </CardHeader>
      <SectionRow title="Description" value={product.description} />
      <SectionRow title="Subtitle" value={product.subtitle} />
      <SectionRow title="Handle" value={product.handle ? `/${product.handle}` : null} />
      <SectionRow title="Material" value={product.material} />
      <SectionRow title="Discountable" value={product.discountable ? 'True' : 'False'} />
    </Card>
  )
}
