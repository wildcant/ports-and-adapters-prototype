import { formOptions } from '@tanstack/form-core'
import type { AdminCreateProductResponse } from '#/api/generated/model'
import { useCreateProduct } from '#/features/products/api/products'
import { useAppForm } from '#/lib/form-hook.ts'
import type { SubmitFormParams } from '#/types/form.ts'
import type { SubmitIntent } from '../components/create-product-form/constants'
import { type ProductFormValues, productFormSchema } from '../components/create-product-form/schemas'

export const productCreateFormOpts = formOptions({
  defaultValues: {
    details: { title: '', subtitle: '', handle: '', description: '' },
    organize: { discountable: true },
    attributes: {
      material: '',
      originCountry: '',
      hsCode: '',
      midCode: '',
      weight: null,
      length: null,
      height: null,
      width: null,
    },
  } satisfies ProductFormValues as ProductFormValues,
  onSubmitMeta: {} as SubmitIntent,
})

export type CreateProductFormParams = SubmitFormParams<AdminCreateProductResponse>

export function useCreateProductForm(params?: CreateProductFormParams) {
  const createMutation = useCreateProduct()

  const form = useAppForm({
    ...productCreateFormOpts,
    validators: { onSubmit: productFormSchema },
    onSubmit: ({ value, meta }) => {
      const status = meta?.intent === 'draft' ? 'draft' : 'published'
      const payload = {
        ...value.details,
        ...value.organize,
        ...value.attributes,
        status,
      } as Parameters<typeof createMutation.mutate>[0]
      createMutation.mutate(payload, {
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
