import { AdminUpdateProduct } from '@proteus/http-schemas/admin'
import type { AdminProduct, AdminUpdateProductResponse } from '#/api/generated/model'
import { useUpdateProduct } from '#/features/products/api/products'
import type { SubmitFormParams } from '#/lib/form.ts'
import { useAppForm } from '#/lib/form-hook.ts'

export type EditProductFormParams = SubmitFormParams<AdminUpdateProductResponse>

export function useEditProductForm(product: AdminProduct, params?: EditProductFormParams) {
  const updateMutation = useUpdateProduct(product.id)

  const form = useAppForm({
    defaultValues: { title: product.title },
    validators: { onSubmit: AdminUpdateProduct },
    onSubmit: ({ value }) => {
      updateMutation.mutate(value, {
        onSuccess: (data) => {
          form.reset()
          params?.onSuccess?.(data)
        },
        onError: (error) => params?.onError?.(error.message),
        onSettled: () => params?.onSettled?.(),
      })
    },
  })

  return { form, isLoading: updateMutation.isPending }
}
