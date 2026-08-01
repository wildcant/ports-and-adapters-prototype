import { Button } from '@proteus/ui'
import {
  type CreateCustomerFormParams,
  useCreateCustomerForm,
} from '#/features/customers/hooks/use-create-customer-form.ts'

type CreateCustomerFormProps = CreateCustomerFormParams

export function CreateCustomerForm(props: CreateCustomerFormProps) {
  const { form } = useCreateCustomerForm(props)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="mb-8 flex flex-wrap items-end gap-3"
    >
      <form.AppField name="firstName">
        {(field) => <field.TextField label="First name" className="w-auto flex-1" placeholder="First name" />}
      </form.AppField>
      <form.AppField name="lastName">
        {(field) => <field.TextField label="Last name" className="w-auto flex-1" placeholder="Last name" />}
      </form.AppField>
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" className="w-auto flex-1" type="email" placeholder="Email" />}
      </form.AppField>
      <Button type="submit" className="self-end">
        Add Customer
      </Button>
    </form>
  )
}
