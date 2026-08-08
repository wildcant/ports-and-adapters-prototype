import { ResetPasswordBody } from '@proteus/http-schemas/auth'
import { useRequestPasswordReset } from '#/features/auth/api/auth'
import type { SubmitFormParams } from '#/lib/form'
import { useAppForm } from '#/lib/form-hook'

export type ForgotPasswordFormParams = SubmitFormParams

export function useForgotPasswordForm(params?: ForgotPasswordFormParams) {
  const resetMutation = useRequestPasswordReset()

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: { onSubmit: ResetPasswordBody },
    onSubmit: ({ value }) => {
      resetMutation.mutate(value, {
        onSuccess: () => {
          form.reset()
          params?.onSuccess?.()
        },
        onError: (error) => params?.onError?.(error.message),
        onSettled: () => params?.onSettled?.(),
      })
    },
  })

  return { form, isPending: resetMutation.isPending }
}
