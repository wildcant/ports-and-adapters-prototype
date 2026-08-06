import { z } from 'zod'
import type { AuthTokenResponse } from '#/api/generated/model'
import { useRegister } from '#/features/auth/api/auth'
import type { SubmitFormParams } from '#/lib/form'
import { useAppForm } from '#/lib/form-hook'

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string(),
  password: z.string().min(1),
})

export type RegisterFormParams = SubmitFormParams<AuthTokenResponse>

export function useRegisterForm(params?: RegisterFormParams) {
  const registerMutation = useRegister()

  const form = useAppForm({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '' },
    validators: { onSubmit: RegisterSchema },
    onSubmit: ({ value }) => {
      registerMutation.mutate(value, {
        onSuccess: (data) => {
          form.reset()
          params?.onSuccess?.(data)
        },
        onError: (error) => params?.onError?.(error.message),
        onSettled: () => params?.onSettled?.(),
      })
    },
  })

  return { form, isPending: registerMutation.isPending }
}
