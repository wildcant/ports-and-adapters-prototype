import { z } from 'zod'
import type { AuthenticateResponse } from '#/api/generated/model'
import { useLogin } from '#/features/auth/api/auth'
import type { SubmitFormParams } from '#/lib/form'
import { useAppForm } from '#/lib/form-hook'

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type LoginFormParams = SubmitFormParams<AuthenticateResponse>

export function useLoginForm(params?: LoginFormParams) {
  const loginMutation = useLogin()

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: LoginSchema },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value, {
        onSuccess: (data) => {
          form.reset()
          params?.onSuccess?.(data)
        },
        onError: (error) => params?.onError?.(error.message),
        onSettled: () => params?.onSettled?.(),
      })
    },
  })

  return { form, isPending: loginMutation.isPending }
}
