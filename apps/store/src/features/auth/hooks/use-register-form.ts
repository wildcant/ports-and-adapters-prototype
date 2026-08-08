import { StoreSignupBody } from '@proteus/http-schemas/store'
import type { AuthenticateResponse } from '#/api/generated/model'
import { useRegister } from '#/features/auth/api/auth'
import type { SubmitFormParams } from '#/lib/form'
import { useAppForm } from '#/lib/form-hook'

export type RegisterFormParams = SubmitFormParams<AuthenticateResponse>

export function useRegisterForm(params?: RegisterFormParams) {
  const registerMutation = useRegister()

  const form = useAppForm({
    defaultValues: {
      firstName: 'Willy',
      lastName: 'Wonka',
      email: 'wily@mail.com',
      password: '123',
    },
    validators: { onSubmit: StoreSignupBody },
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
