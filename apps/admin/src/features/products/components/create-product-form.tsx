import { Button } from '@proteus/ui'
import { KeyboundForm } from '#/components/modals/keybound-form'
import { RouteFocusModal } from '#/components/modals/route-focus-modal/route-focus-modal'
import { useRouteModal } from '#/components/modals/route-modal-provider/use-route-modal'
import { useCreateProductForm } from '#/features/products/hooks/use-create-product-form'

export function CreateProductForm() {
  const { handleSuccess } = useRouteModal()

  const { form } = useCreateProductForm({
    onSuccess: (data) => handleSuccess(`../${data.product.id}`),
  })

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm onSubmit={form.handleSubmit} className="flex flex-1 flex-col">
        <RouteFocusModal.Header>
          <RouteFocusModal.Title className="sr-only">Create Product</RouteFocusModal.Title>
        </RouteFocusModal.Header>
        <RouteFocusModal.Body className="p-4">
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" autoFocus placeholder="Product title" />}
          </form.AppField>
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <RouteFocusModal.Close render={<Button variant="secondary" size="sm" />}>Cancel</RouteFocusModal.Close>
          <Button type="submit" size="sm">
            Save
          </Button>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
