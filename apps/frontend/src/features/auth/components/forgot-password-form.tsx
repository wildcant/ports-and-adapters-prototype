import type { ForgotPasswordFormParams } from '#/features/auth/hooks/use-forgot-password-form'
import { useForgotPasswordForm } from '#/features/auth/hooks/use-forgot-password-form'

export function ForgotPasswordForm(props: ForgotPasswordFormParams) {
  const { form, isPending } = useForgotPasswordForm(props)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="w-full"
    >
      <div className="flex w-full flex-col gap-y-2">
        <form.AppField name="email">
          {(field) => <field.TextField label="Email" type="email" autoComplete="email" autoFocus />}
        </form.AppField>
      </div>
      <button type="submit" disabled={isPending} className="demo-button mt-6 w-full">
        {isPending ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  )
}
