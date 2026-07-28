import { type CustomerResponse, UpdateCustomer, type UpdateCustomerBody } from '@proteus/http-schemas'
import { useUpdateCustomer } from '#/features/customers/api/customers'
import type { SubmitFormParams } from '#/lib/form.ts'
import { useAppForm } from '#/lib/form-hook.ts'

export type UpdateCustomerFormParams = SubmitFormParams<CustomerResponse> & {
  id: string
  defaultValues: UpdateCustomerBody
}

export function useUpdateCustomerForm(params: UpdateCustomerFormParams) {
  const updateMutation = useUpdateCustomer()

  const form = useAppForm({
    defaultValues: params.defaultValues,
    validators: { onSubmit: UpdateCustomer },
    onSubmit: ({ value }) => {
      updateMutation.mutate(
        { id: params.id, data: value },
        {
          onSuccess: (data) => params?.onSuccess?.(data),
          onError: (error) => params?.onError?.(error.message),
          onSettled: () => params?.onSettled?.(),
        },
      )
    },
  })

  return { form, isLoading: updateMutation.isPending }
}
