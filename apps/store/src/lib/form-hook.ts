import { createFormHook } from '@tanstack/react-form'
import { TextField } from '#/components/form/text-field.tsx'
import { fieldContext, formContext } from '#/lib/form-context.ts'

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: {},
})
