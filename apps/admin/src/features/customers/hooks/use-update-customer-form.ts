import { AdminUpdateCustomer, type AdminUpdateCustomerBody } from '@proteus/http-schemas/admin'
import type { AdminCustomerResponse } from '#/api/generated/model'
import { useUpdateCustomer } from '#/features/customers/api/customers'
import { useAppForm } from '#/lib/form-hook.ts'
import type { SubmitFormParams } from '#/types/form.ts'

export type UpdateCustomerFormParams = SubmitFormParams<AdminCustomerResponse> & {
  id: string
  defaultValues: AdminUpdateCustomerBody
}

export function useUpdateCustomerForm(params: UpdateCustomerFormParams) {
  const updateMutation = useUpdateCustomer()

  const form = useAppForm({
    defaultValues: params.defaultValues,
    validators: { onSubmit: AdminUpdateCustomer },
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
