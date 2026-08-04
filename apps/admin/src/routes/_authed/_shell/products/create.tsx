import { createFileRoute } from '@tanstack/react-router'
import { RouteFocusModal } from '#/components/modals/route-focus-modal/route-focus-modal'
import { CreateProductForm } from '#/features/products/components/create-product-form/create-product-form'

export const Route = createFileRoute('/_authed/_shell/products/create')({
  component: CreateProductRoute,
})

function CreateProductRoute() {
  return (
    <RouteFocusModal>
      <CreateProductForm />
    </RouteFocusModal>
  )
}
