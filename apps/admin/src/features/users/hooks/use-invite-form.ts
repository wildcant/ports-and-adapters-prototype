import { AdminCreateInvite } from '@proteus/http-schemas/admin'
import type { AdminInviteResponse } from '#/api/generated/model'
import { useCreateInvite } from '#/features/users/api/invites'
import { useAppForm } from '#/lib/form-hook'
import type { SubmitFormParams } from '#/types/form'

export type InviteFormParams = SubmitFormParams<AdminInviteResponse>

export function useInviteForm(params?: InviteFormParams) {
  const createMutation = useCreateInvite()

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: { onSubmit: AdminCreateInvite },
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
