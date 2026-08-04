import { AdminCreateCustomer } from '@proteus/http-schemas/admin'
import type { AdminCreateCustomersResponse } from '#/api/generated/model'
import { useCreateCustomer } from '#/features/customers/api/customers'
import type { SubmitFormParams } from '#/lib/form.ts'
import { useAppForm } from '#/lib/form-hook.ts'

export type CreateCustomerFormParams = SubmitFormParams<AdminCreateCustomersResponse>

export function useCreateCustomerForm(params?: CreateCustomerFormParams) {
  const createMutation = useCreateCustomer()

  const form = useAppForm({
    defaultValues: { firstName: '', lastName: '', email: '' },
    validators: { onSubmit: AdminCreateCustomer },
    onSubmit: ({ value }) => {
      createMutation.mutate([value], {
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
