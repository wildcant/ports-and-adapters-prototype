import { AdminCreateProduct } from '@proteus/http-schemas/admin'
import type { AdminCreateProductResponse } from '#/api/generated/model'
import { useCreateProduct } from '#/features/products/api/products'
import type { SubmitFormParams } from '#/lib/form.ts'
import { useAppForm } from '#/lib/form-hook.ts'

export type CreateProductFormParams = SubmitFormParams<AdminCreateProductResponse>

export function useCreateProductForm(params?: CreateProductFormParams) {
  const createMutation = useCreateProduct()

  const form = useAppForm({
    defaultValues: { title: '' },
    validators: { onSubmit: AdminCreateProduct },
    onSubmit: ({ value }) => {
      createMutation.mutate(value, {
        onSuccess: (data) => {
          form.reset()
          params?.onSuccess?.(data)
        },
        onError: (error) => params?.onError?.(error.message),
        onSettled: () => params?.onSettled?.(),
      })
    },
  })

  return { form, isLoading: createMutation.isPending }
}
