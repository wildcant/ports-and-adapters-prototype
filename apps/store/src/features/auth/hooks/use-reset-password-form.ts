import { UpdatePasswordBody } from '@proteus/http-schemas/auth'
import { useUpdatePassword } from '#/features/auth/api/auth'
import type { SubmitFormParams } from '#/lib/form'
import { useAppForm } from '#/lib/form-hook'

export type ResetPasswordFormParams = SubmitFormParams & { token: string }

export function useResetPasswordForm({ token, ...params }: ResetPasswordFormParams) {
  const updateMutation = useUpdatePassword()

  const form = useAppForm({
    defaultValues: { password: '' },
    validators: { onSubmit: UpdatePasswordBody },
    onSubmit: ({ value }) => {
      updateMutation.mutate(
        { ...value, token },
        {
          onSuccess: () => {
            form.reset()
            params.onSuccess?.()
          },
          onError: (error) => params.onError?.(error.message),
          onSettled: () => params.onSettled?.(),
        },
      )
    },
  })

  return { form, isPending: updateMutation.isPending }
}
