# React Hook Form vs TanStack Form

A comprehensive, primary-source comparison for choosing a React form library (July 2026).

---

## At a Glance

| Dimension | React Hook Form (v7) | TanStack Form (v1) |
|---|---|---|
| First release | March 2019 | April 2023 (as `@tanstack/react-form`) |
| GitHub stars | 44,805 | 6,626 |
| Weekly npm downloads | ~57.6M | ~2.4M |
| Latest version | 7.83.0 | 1.33.2 |
| License | MIT | MIT |
| Zero dependencies | Yes | No (`@tanstack/form-core`, `@tanstack/store`, `@tanstack/pacer-lite`) |
| Framework support | React only | React, Vue, Angular, Solid, Svelte, Lit, Preact |

Sources: npm registry, GitHub API (fetched 2026-07-28).

---

## 1. Philosophy and Design Approach

### React Hook Form

Uncontrolled-first. Fields register via refs (`register("name")`) so the DOM owns the values and React never re-renders on every keystroke. The library "leverages existing HTML markup" and treats the browser's constraint validation API as a first-class citizen. When a component does not expose a ref (e.g., Radix/Shadcn `<Select>`), a `<Controller>` wrapper bridges it into the uncontrolled model.

> "Minimizes the number of re-renders, minimizes validation computation, and provides faster mounting." -- [react-hook-form.com](https://react-hook-form.com/)

### TanStack Form

Controlled and headless. Every field is a controlled component whose value lives in TanStack's store. The library exposes a render-prop `<form.Field>` component; you wire `field.state.value`, `field.handleChange`, and `field.handleBlur` yourself. This gives "complete control over markup and styling" without forcing a UI wrapper.

> "Form complexity is explicit rather than hidden behind abstractions." -- [tanstack.com/form](https://tanstack.com/form/latest)

**Key difference:** React Hook Form avoids re-renders by design (refs); TanStack Form avoids them through granular store subscriptions (`form.Subscribe` selects only the state slices a component needs).

---

## 2. API Surface Comparison

### 2.1 Basic Form Setup

**React Hook Form:**

```tsx
import { useForm } from "react-hook-form"

type FormData = { firstName: string; lastName: string }

function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const onSubmit = (data: FormData) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName", { required: true, maxLength: 20 })} />
      {errors.firstName?.type === "required" && <p>First name required</p>}

      <input {...register("lastName", { pattern: /^[A-Za-z]+$/i })} />
      <input type="submit" />
    </form>
  )
}
```

`register()` returns `{ onChange, onBlur, ref, name }` which are spread onto the input element. The form values live in the DOM, not in React state.

Source: [react-hook-form.com/get-started](https://react-hook-form.com/get-started)

**TanStack Form:**

```tsx
import { useForm } from "@tanstack/react-form"

function App() {
  const form = useForm({
    defaultValues: { firstName: "", lastName: "" },
    onSubmit: async ({ value }) => console.log(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="firstName"
        children={(field) => (
          <input
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "..." : "Submit"}
          </button>
        )}
      />
    </form>
  )
}
```

Every field requires explicit `value`, `onChange`, and `onBlur` wiring. The `onSubmit` handler is declared on the `useForm` call, not on the `<form>` element.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### 2.2 Controlled Inputs

**React Hook Form** uses the `<Controller>` component for inputs that do not expose a ref:

```tsx
import { Controller, useForm } from "react-hook-form"

function App() {
  const { control, handleSubmit } = useForm()
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => <Input {...field} />}
      />
    </form>
  )
}
```

`field` contains `{ value, onChange, onBlur, ref, name }`. The `{...field}` spread connects the controlled component.

Source: [react-hook-form.com/get-started](https://react-hook-form.com/get-started)

**TanStack Form** is controlled by default -- every `<form.Field>` is already a controlled pattern:

```tsx
<form.Field
  name="firstName"
  children={(field) => (
    <Input
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

There is no separate "Controller" component because the render-prop pattern is the only pattern.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### 2.3 Field-Level Validation

**React Hook Form** uses `register` options or `Controller.rules`:

```tsx
// Native validation rules via register
<input {...register("firstName", {
  required: "First name is required",
  maxLength: { value: 20, message: "Max 20 characters" },
  pattern: { value: /^[A-Za-z]+$/i, message: "Letters only" },
})} />

// Custom validate function (sync or async, single or multiple)
<input {...register("username", {
  validate: {
    notAdmin: (v) => v !== "admin" || "Reserved name",
    checkAvailability: async (v) => {
      const available = await checkUsername(v)
      return available || "Username taken"
    },
  },
})} />
```

Supported built-in rules: `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate`.

Source: [react-hook-form.com/docs/useform/register](https://react-hook-form.com/docs/useform/register)

**TanStack Form** uses a `validators` object on `<form.Field>`:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? "You must be 13 to make an account" : undefined,
    onBlur: ({ value }) =>
      value < 0 ? "Invalid value" : undefined,
  }}
>
  {(field) => (
    <>
      <input
        value={field.state.value}
        type="number"
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {!field.state.meta.isValid && (
        <em role="alert">{field.state.meta.errors.join(", ")}</em>
      )}
    </>
  )}
</form.Field>
```

Validators are plain functions keyed by trigger timing (`onChange`, `onBlur`, `onSubmit`). Return a string for an error, `undefined` for valid.

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### 2.4 Schema Validation (Zod)

**React Hook Form** uses resolvers from `@hookform/resolvers`:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  age: z.number().positive().int(),
})
type FormData = z.infer<typeof schema>

function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register("firstName")} />
      {errors.firstName && <p>{errors.firstName.message}</p>}
      <input type="number" {...register("age", { valueAsNumber: true })} />
      {errors.age && <p>{errors.age.message}</p>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

The `resolver` replaces built-in validation rules entirely -- you cannot combine `resolver` with `register` rules.

Source: [react-hook-form.com/get-started](https://react-hook-form.com/get-started), [react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform)

**TanStack Form** supports Standard Schema libraries (Zod, Valibot, ArkType) natively -- no adapter package needed:

```tsx
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

const userSchema = z.object({
  age: z.number().gte(13, "You must be 13 to make an account"),
})

function App() {
  const form = useForm({
    defaultValues: { age: 0 },
    validators: { onChange: userSchema },
    onSubmit: async ({ value }) => console.log(value),
  })
  return (
    <form.Field
      name="age"
      children={(field) => (
        <>
          <input
            value={field.state.value}
            type="number"
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
          />
          {!field.state.meta.isValid && (
            <em>{field.state.meta.errors.join(", ")}</em>
          )}
        </>
      )}
    />
  )
}
```

Schemas can also be applied per-field:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: z.number().gte(13, "You must be 13 to make an account"),
    onChangeAsyncDebounceMs: 500,
    onChangeAsync: z.number().refine(
      async (value) => {
        const currentAge = await fetchCurrentAgeOnProfile()
        return value >= currentAge
      },
      { message: "You can only increase the age" },
    ),
  }}
/>
```

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### 2.5 Async Validation

**React Hook Form** supports async validation via custom `validate` functions, but has no built-in debouncing:

```tsx
<input {...register("username", {
  validate: async (value) => {
    const available = await checkUsername(value)
    return available || "Username taken"
  },
})} />
```

You must implement your own debounce logic if the async call fires on every keystroke.

Source: [react-hook-form.com/docs/useform/register](https://react-hook-form.com/docs/useform/register)

**TanStack Form** has first-class async validators with built-in `asyncDebounceMs`:

```tsx
<form.Field
  name="username"
  asyncDebounceMs={500}
  validators={{
    onChange: ({ value }) =>
      value.length < 3 ? "Too short" : undefined,
    onChangeAsync: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return value.includes("error") ? 'No "error" allowed' : undefined
    },
  }}
/>
```

Sync validators run first; async validators only run if sync passes. Override per-validator debounce:

```tsx
<form.Field
  name="age"
  asyncDebounceMs={500}
  validators={{
    onChangeAsyncDebounceMs: 1500,   // override for onChange only
    onChangeAsync: async ({ value }) => { /* ... */ },
    onBlurAsync: async ({ value }) => { /* ... */ },  // uses default 500ms
  }}
/>
```

The `asyncAlways: true` option runs async validators even when sync fails.

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### 2.6 Watching / Subscribing to Field Values

**React Hook Form** provides three mechanisms with different re-render characteristics:

```tsx
const { register, watch, getValues } = useForm<FormData>()

// 1. watch() -- triggers re-render on change
const firstName = watch("firstName")              // single field
const [first, last] = watch(["firstName", "lastName"])  // multiple
const allValues = watch()                          // entire form

// 2. getValues() -- snapshot, NO re-render
const handleClick = () => {
  const vals = getValues()           // all values
  const name = getValues("firstName") // single value
  const subset = getValues(["firstName", "lastName"]) // multiple
}

// 3. Conditional rendering based on watch
const showAge = watch("showAge", false)
return (
  <form>
    <input type="checkbox" {...register("showAge")} />
    {showAge && <input type="number" {...register("age")} />}
  </form>
)
```

`watch` causes root-level re-renders. For performance-sensitive cases, use `useWatch` (subscribes at the component level) or `getValues` (no subscription).

Source: [react-hook-form.com/docs/useform/watch](https://react-hook-form.com/docs/useform/watch), [react-hook-form.com/docs/useform/getvalues](https://react-hook-form.com/docs/useform/getvalues)

**TanStack Form** uses `form.Subscribe` and `useSelector`:

```tsx
// 1. form.Subscribe component -- granular re-render
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <button type="submit" disabled={!canSubmit}>
      {isSubmitting ? "..." : "Submit"}
    </button>
  )}
/>

// 2. useSelector hook -- for use outside JSX
import { useSelector } from "@tanstack/react-form"
const firstName = useSelector(form.store, (state) => state.values.firstName)
const errors = useSelector(form.store, (state) => state.errorMap)
```

The selector function is mandatory -- omitting it causes unnecessary re-renders. Only the selected state slice triggers a re-render.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### 2.7 Dependent / Linked Fields

**React Hook Form** uses `watch` + `useEffect` + `setValue` or the `deps` option on `register`:

```tsx
const { watch, register, setValue, formState } = useForm<FormValues>({
  defaultValues: { a: "", b: "", c: "" },
})
const [a, b] = watch(["a", "b"])

useEffect(() => {
  if (formState.touchedFields.a && formState.touchedFields.b && a && b) {
    setValue("c", `${a} ${b}`)
  }
}, [setValue, a, b, formState])
```

The `deps` register option can trigger validation on dependent fields:

```tsx
<input {...register("password")} />
<input {...register("confirmPassword", {
  deps: ["password"],  // re-validates when password changes
  validate: (value, formValues) =>
    value === formValues.password || "Passwords must match",
})} />
```

Source: [react-hook-form.com/docs/useform/setvalue](https://react-hook-form.com/docs/useform/setvalue), [react-hook-form.com/docs/useform/register](https://react-hook-form.com/docs/useform/register)

**TanStack Form** provides `onChangeListenTo` and `onBlurListenTo` on validators:

```tsx
<form.Field name="password">
  {(field) => (
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
</form.Field>

<form.Field
  name="confirm_password"
  validators={{
    onChangeListenTo: ["password"],
    onChange: ({ value, fieldApi }) => {
      if (value !== fieldApi.form.getFieldValue("password")) {
        return "Passwords do not match"
      }
      return undefined
    },
  }}
>
  {(field) => (
    <div>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors.map((err) => (
        <div key={err}>{err}</div>
      ))}
    </div>
  )}
</form.Field>
```

`onChangeListenTo: ["password"]` re-runs the `confirm_password` validator whenever `password` changes, without any `useEffect` boilerplate.

Source: [tanstack.com/form/v1/docs/framework/react/guides/linked-fields](https://tanstack.com/form/v1/docs/framework/react/guides/linked-fields)

### 2.8 Side Effects / Listeners

**React Hook Form** does not have a dedicated listener API. Side effects are implemented with `watch` + `useEffect`:

```tsx
const country = watch("country")
useEffect(() => {
  setValue("province", "")
}, [country, setValue])
```

Source: [react-hook-form.com/docs/useform/watch](https://react-hook-form.com/docs/useform/watch)

**TanStack Form** has a first-class `listeners` API at both field and form levels:

```tsx
// Field-level listener
<form.Field
  name="country"
  listeners={{
    onChange: ({ value }) => {
      console.log(`Country changed to: ${value}, resetting province`)
      form.setFieldValue("province", "")
    },
  }}
>
  {(field) => (
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
</form.Field>

// With debouncing
<form.Field
  name="country"
  listeners={{
    onChangeDebounceMs: 500,
    onChange: ({ value }) => {
      form.setFieldValue("province", "")
    },
  }}
/>
```

Five listener events: `onChange`, `onBlur`, `onMount`, `onSubmit`, `onUnmount`.

Form-level listeners propagate to all fields:

```tsx
const form = useForm({
  listeners: {
    onMount: ({ formApi }) => {
      loggingService("mount", formApi.state.values)
    },
    onChange: ({ formApi, fieldApi }) => {
      if (formApi.state.isValid) {
        formApi.handleSubmit()
      }
      console.log(fieldApi.name, fieldApi.state.value)
    },
    onChangeDebounceMs: 500,
  },
})
```

Source: [tanstack.com/form/v1/docs/framework/react/guides/listeners](https://tanstack.com/form/v1/docs/framework/react/guides/listeners)

### 2.9 Array / Dynamic Fields

**React Hook Form** uses the `useFieldArray` hook:

```tsx
import { useForm, useFieldArray } from "react-hook-form"

function App() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: { people: [{ firstName: "", lastName: "" }] },
  })
  const { fields, append, remove, swap, move, insert, update, replace, prepend } =
    useFieldArray({ control, name: "people" })

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((item, index) => (
        <li key={item.id}>  {/* Must use item.id, not index */}
          <input {...register(`people.${index}.firstName`)} />
          <button type="button" onClick={() => remove(index)}>Delete</button>
        </li>
      ))}
      <button type="button" onClick={() => append({ firstName: "", lastName: "" })}>
        Add
      </button>
    </form>
  )
}
```

Methods: `append`, `prepend`, `insert`, `swap`, `move`, `update`, `replace`, `remove`. Validation rules (`required`, `minLength`, `maxLength`, `validate`) can be applied via the `rules` option.

Source: [react-hook-form.com/docs/usefieldarray](https://react-hook-form.com/docs/usefieldarray)

**TanStack Form** uses `mode="array"` on `<form.Field>`:

```tsx
<form.Field
  name="hobbies"
  mode="array"
  children={(hobbiesField) => (
    <div>
      {hobbiesField.state.value.map((_, i) => (
        <form.Field
          key={i}
          name={`hobbies[${i}].name`}
          children={(field) => (
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        />
      ))}
      <button
        type="button"
        onClick={() => hobbiesField.pushValue({ name: "", description: "" })}
      >
        Add hobby
      </button>
    </div>
  )}
/>
```

Array methods are on the field API directly: `pushValue`, `removeValue`, `swapValues`, `moveValue`, `insertValue`, `replaceValue`, `clearValues`.

Source: [tanstack.com/form/v1/docs/framework/react/guides/arrays](https://tanstack.com/form/v1/docs/framework/react/guides/arrays), [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

**Comparison table:**

| Operation | React Hook Form (`useFieldArray`) | TanStack Form (`mode="array"`) |
|---|---|---|
| Add to end | `append(obj)` | `pushValue(obj)` |
| Add to start | `prepend(obj)` | `insertValue(0, obj)` |
| Insert at index | `insert(index, obj)` | `insertValue(index, obj)` |
| Remove at index | `remove(index)` | `removeValue(index)` |
| Swap two items | `swap(a, b)` | `swapValues(a, b)` |
| Move item | `move(from, to)` | `moveValue(from, to)` |
| Replace at index | `update(index, obj)` | `replaceValue(index, obj)` |
| Replace all | `replace(arr)` | N/A (set via form API) |
| Clear all | `remove()` (no args) | `clearValues()` |
| React key | `item.id` (auto-generated) | Array index (manual) |

### 2.10 Form Context / Nested Components

**React Hook Form** uses `FormProvider` and `useFormContext`:

```tsx
import { useForm, FormProvider, useFormContext } from "react-hook-form"

function App() {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)}>
        <NestedInput />
        <input type="submit" />
      </form>
    </FormProvider>
  )
}

function NestedInput() {
  const { register } = useFormContext()
  return <input {...register("nested")} />
}
```

`useFormContext()` returns the exact same API as `useForm()`. For subscribing to form state in nested components, use `useFormState` instead of destructuring `formState` from `useFormContext()` to avoid Proxy subscription issues.

Source: [react-hook-form.com/docs/useformcontext](https://react-hook-form.com/docs/useformcontext)

**TanStack Form** does not need a separate context API. The `form` object returned by `useForm` is passed around or used inline via `<form.Field>`. Since `form.Field` is a property of the form instance, it is automatically scoped. For deeply nested components, you pass the `form` object as a prop:

```tsx
function NestedInput({ form }: { form: ReturnType<typeof useForm> }) {
  return (
    <form.Field
      name="nested"
      children={(field) => (
        <input
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      )}
    />
  )
}
```

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### 2.11 Error Display

**React Hook Form:**

```tsx
const { formState: { errors } } = useForm()

// Access by field name
{errors.firstName && <p>{errors.firstName.message}</p>}
{errors.firstName?.type === "required" && <p>Required</p>}

// criteriaMode: "all" gathers all errors per field
const { formState: { errors } } = useForm({ criteriaMode: "all" })
```

Errors live in `formState.errors` as a flat-ish object keyed by field name. Nested field errors use hierarchical structure.

Source: [react-hook-form.com/docs/useform/formstate](https://react-hook-form.com/docs/useform/formstate), [react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform)

**TanStack Form:**

```tsx
// Array of all errors
{!field.state.meta.isValid && (
  <em>{field.state.meta.errors.join(", ")}</em>
)}

// ErrorMap -- errors keyed by trigger type
{field.state.meta.errorMap["onChange"] ? (
  <em>{field.state.meta.errorMap["onChange"]}</em>
) : null}

// Typed errors (validators can return objects, not just strings)
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? { isOldEnough: false } : undefined,
  }}
>
  {(field) => (
    <>
      {!field.state.meta.errorMap["onChange"]?.isOldEnough ? (
        <em>The user is not old enough</em>
      ) : null}
    </>
  )}
</form.Field>

// Form-level errors
const formErrorMap = useSelector(form.store, (state) => state.errorMap)
{formErrorMap.onChange ? <em>{formErrorMap.onChange}</em> : null}
```

TanStack Form's `errorMap` lets you distinguish errors by trigger type. Validators can return typed objects, not just strings.

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### 2.12 Default Values and Reset

**React Hook Form:**

```tsx
const { register, reset, handleSubmit, formState } = useForm({
  defaultValues: { firstName: "", age: 0 },
  // OR async:
  // defaultValues: async () => fetch("/api/user").then(r => r.json()),
})

// Full reset
reset()

// Reset with new values (updates defaultValues reference)
reset({ firstName: "Bill" })

// Partial reset with options
reset({ firstName: "Bill" }, { keepErrors: true, keepDirty: true })

// Function-based reset
reset((formValues) => ({ ...formValues, lastName: "updated" }))

// Post-submit reset
useEffect(() => {
  if (formState.isSubmitSuccessful) {
    reset({ firstName: "" })
  }
}, [formState.isSubmitSuccessful, reset])
```

Reset options: `keepErrors`, `keepDirty`, `keepDirtyValues`, `keepValues`, `keepDefaultValues`, `keepIsSubmitted`, `keepIsSubmitSuccessful`, `keepTouched`, `keepIsValid`, `keepSubmitCount`.

The `values` prop on `useForm` provides reactive external state updates:

```tsx
const { register } = useForm({
  values: externalData,  // form updates when externalData changes
  resetOptions: { keepDirtyValues: true },  // preserve user edits
})
```

Source: [react-hook-form.com/docs/useform/reset](https://react-hook-form.com/docs/useform/reset), [react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform)

**TanStack Form:**

```tsx
const form = useForm({
  defaultValues: { firstName: "", age: 0 },
  onSubmit: async ({ value }) => console.log(value),
})

// Reset to defaultValues
form.reset()

// Reset button (prevent native HTML reset)
<button
  type="reset"
  onClick={(event) => {
    event.preventDefault()
    form.reset()
  }}
>
  Reset
</button>
```

TanStack Form's reset is simpler -- it resets to the `defaultValues` provided at initialization. There is no equivalent to React Hook Form's granular `keepDirty` / `keepErrors` options.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### 2.13 TypeScript Usage

**React Hook Form:**

```tsx
type FormData = { firstName: string; lastName: string; age: number }

const { register, handleSubmit, watch, setValue } = useForm<FormData>({
  defaultValues: { firstName: "", lastName: "", age: 0 },
})

// All of these are type-checked against FormData:
register("firstName")           // OK
register("nonExistent")         // Type error
watch("age")                    // returns number
setValue("age", "string")       // Type error

// Nested paths use string templates:
register(`people.${index}.name`)  // works but inference can be shallow
```

Field paths for nested objects/arrays use string interpolation, which can lose deep inference.

Source: [react-hook-form.com/get-started](https://react-hook-form.com/get-started), [react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform)

**TanStack Form:**

```tsx
const form = useForm({
  defaultValues: {
    firstName: "",
    age: 0,
    hobbies: [{ name: "" }],
  },
  onSubmit: async ({ value }) => {
    // value is fully typed: { firstName: string; age: number; hobbies: { name: string }[] }
    console.log(value)
  },
})

// Field names, values, and handlers are all inferred:
<form.Field
  name="firstName"   // autocomplete from defaultValues keys
  children={(field) => {
    // field.state.value is string
    // field.handleChange expects string
  }}
/>

<form.Field
  name="age"
  children={(field) => {
    // field.state.value is number
    // field.handleChange expects number
  }}
/>
```

TanStack Form infers field types from `defaultValues` through the entire chain: field name autocomplete, value types, handler argument types, validator argument types, and submit handler types. No string-path gaps.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

---

## 3. Reactivity and Re-render Model

This is the most fundamental architectural difference between the two libraries.

### React Hook Form: Ref-Based, Minimal Re-renders

React Hook Form stores field values in DOM refs, not React state. This means:

1. **Typing in an input does NOT re-render the component.** The DOM element holds the value directly.
2. **The component that calls `useForm` re-renders** when observed `formState` properties change (errors, isDirty, isSubmitting, etc.).
3. **Proxy-based subscription**: `formState` uses a JavaScript Proxy that tracks which properties are read during render. Only changes to read properties trigger re-renders.

```tsx
// Only re-renders when errors or isSubmitting change -- NOT on every keystroke
const { register, formState: { errors, isSubmitting } } = useForm()
```

4. **`watch()`** opts into re-renders for specific values. It causes root-level re-renders -- use `useWatch` for component-level subscriptions.
5. **`getValues()`** reads the current value without any subscription or re-render.

**Gotcha**: Because values live in refs, there are potential stale-closure issues. The `formState` Proxy requires that you access properties before render, not conditionally:

```tsx
// WRONG -- Proxy cannot track conditional access
const { formState } = useForm()
return formState.isDirty && formState.isValid ? <Submit /> : null

// RIGHT -- destructure first
const { isDirty, isValid } = formState
return isDirty && isValid ? <Submit /> : null
```

Source: [react-hook-form.com/docs/useform/formstate](https://react-hook-form.com/docs/useform/formstate), [react-hook-form.com](https://react-hook-form.com/)

### TanStack Form: Store-Based, Granular Subscriptions

TanStack Form stores all values in `@tanstack/store`. Every field is controlled:

1. **Every keystroke re-renders the field component** (the `children` render-prop of `<form.Field>`).
2. **The blast radius is limited**: a change to field A does NOT re-render field B, because each `<form.Field>` subscribes only to its own slice of state.
3. **`form.Subscribe`** adds subscriptions to arbitrary state slices. Always provide a `selector` to avoid unnecessary re-renders.

```tsx
// Only re-renders when canSubmit or isSubmitting changes
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <button disabled={!canSubmit}>Submit</button>
  )}
/>
```

4. **`useSelector`** provides the same granular subscription as a hook:

```tsx
const firstName = useSelector(form.store, (state) => state.values.firstName)
```

**Trade-off**: Per-field re-renders are more predictable (no stale closures, no ref-timing bugs), but there are more re-renders than React Hook Form's zero-re-render ref model.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### Summary Table

| Aspect | React Hook Form | TanStack Form |
|---|---|---|
| Where values live | DOM refs | `@tanstack/store` |
| Re-render on keystroke | No (ref-based) | Yes (field component only) |
| Cross-field isolation | N/A (no re-renders at all) | Yes (each field subscribes to own slice) |
| State subscription | Proxy on `formState` | `form.Subscribe` / `useSelector` with selector |
| Stale closure risk | Higher (ref-based) | Lower (controlled) |
| Conditional state access | Must destructure before render | Selector function handles it |

---

## 4. Validation Architecture

### Timing and Triggers

| Trigger | React Hook Form | TanStack Form |
|---|---|---|
| On change | `mode: "onChange"` (global) | `validators.onChange` (per-field) |
| On blur | `mode: "onBlur"` (global) | `validators.onBlur` (per-field) |
| On submit | `mode: "onSubmit"` (default, global) | `validators.onSubmit` (per-field) |
| On touched | `mode: "onTouched"` (first blur, then onChange) | No direct equivalent |
| All triggers | `mode: "all"` | Combine `onChange` + `onBlur` + `onSubmit` |
| Re-validation after error | `reValidateMode` (global) | N/A (per-trigger) |

React Hook Form's `mode` is a global setting on `useForm`. TanStack Form configures timing per-field per-validator, giving finer control.

Source: [react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform), [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### Async Validation

| Feature | React Hook Form | TanStack Form |
|---|---|---|
| Async support | Yes (via `validate` returning Promise) | Yes (dedicated `onChangeAsync`, `onBlurAsync`, `onSubmitAsync`) |
| Built-in debounce | No | Yes (`asyncDebounceMs`, per-field, per-validator override) |
| Sync-before-async gating | No (manual) | Yes (sync runs first, async only on sync pass) |
| Override gating | N/A | `asyncAlways: true` |
| `isValidating` state | `formState.isValidating`, `formState.validatingFields` | `field.state.meta.isValidating` |

### Schema Adapters

| Library | React Hook Form | TanStack Form |
|---|---|---|
| Zod | `@hookform/resolvers/zod` | Native (Standard Schema) |
| Yup | `@hookform/resolvers/yup` | Native (Standard Schema) |
| Valibot | `@hookform/resolvers/valibot` | Native (Standard Schema) |
| ArkType | N/A | Native (Standard Schema) |
| Effect/Schema | N/A | Native (Standard Schema) |
| Joi | `@hookform/resolvers/joi` | N/A |
| Superstruct | `@hookform/resolvers/superstruct` | N/A |
| Vest | `@hookform/resolvers/vest` | N/A |
| Custom resolver | Yes (`resolver` function) | Yes (plain validator functions) |

React Hook Form requires a separate `@hookform/resolvers` package. TanStack Form uses the [Standard Schema](https://github.com/standard-schema/standard-schema) spec to support compliant libraries with zero adapter code.

Source: [react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform), [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### Form-Level Validators Setting Field Errors

**React Hook Form** uses `setError()` imperatively:

```tsx
const { setError } = useForm()
// After server response:
setError("email", { type: "server", message: "Email already exists" })
```

**TanStack Form** can return field-targeted errors from form-level validators:

```tsx
const form = useForm({
  validators: {
    onSubmitAsync: async ({ value }) => {
      const errors = await validateOnServer(value)
      if (errors) {
        return {
          form: "Invalid data",
          fields: {
            age: "Must be 13 or older",
            "details.email": "An email is required",
            "socials[0].url": "The provided URL does not exist",
          },
        }
      }
      return null
    },
  },
})
```

This pattern is useful for server-side validation responses where the server returns errors keyed by field name.

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

### Error Types

**React Hook Form**: Errors are objects with `{ type, message, ref }`. `criteriaMode: "all"` gathers all errors per field.

**TanStack Form**: Errors are stored in two structures:
- `field.state.meta.errors` -- flat array of all errors
- `field.state.meta.errorMap` -- object keyed by trigger (`onChange`, `onBlur`, `onSubmit`)

Validators can return typed objects (not just strings), enabling structured error data:

```tsx
validators={{
  onChange: ({ value }) => value < 13 ? { isOldEnough: false, minAge: 13 } : undefined,
}}
// Access: field.state.meta.errorMap["onChange"]?.minAge
```

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

---

## 5. Form State

### React Hook Form `formState` Properties

| Property | Type | Description |
|---|---|---|
| `isDirty` | boolean | Any field modified from default |
| `dirtyFields` | object | Which fields have been modified |
| `touchedFields` | object | Which fields have been interacted with |
| `isSubmitted` | boolean | Form has been submitted (persists until `reset()`) |
| `isSubmitSuccessful` | boolean | Last submission had no runtime errors |
| `isSubmitting` | boolean | Currently submitting |
| `isLoading` | boolean | Async `defaultValues` still loading |
| `submitCount` | number | Total submission attempts |
| `isValid` | boolean | No validation errors |
| `isValidating` | boolean | Validation in progress |
| `validatingFields` | object | Fields undergoing async validation |
| `errors` | object | Field-level error messages |
| `disabled` | boolean | Form disabled via `useForm({ disabled: true })` |
| `isReady` | boolean | Subscription setup complete |
| `defaultValues` | object | Current default values |

Source: [react-hook-form.com/docs/useform/formstate](https://react-hook-form.com/docs/useform/formstate)

### TanStack Form Field State (`field.state`)

| Property | Type | Description |
|---|---|---|
| `value` | T | Current field value |
| `meta.errors` | array | All validation errors |
| `meta.errorMap` | object | Errors keyed by trigger type |
| `meta.isValidating` | boolean | Async validation in progress |
| `meta.isTouched` | boolean | User has interacted |
| `meta.isDirty` | boolean | Value changed (persistent -- stays true even if reverted) |
| `meta.isPristine` | boolean | Opposite of `isDirty` |
| `meta.isBlurred` | boolean | Field has lost focus |
| `meta.isDefaultValue` | boolean | Current value equals default |
| `meta.isValid` | boolean | No validation errors |

Note: `isDirty` in TanStack Form is persistent -- once the field is changed, it stays dirty even if the value is reverted. Use `!isDefaultValue` for non-persistent dirty checking.

Source: [tanstack.com/form/v1/docs/framework/react/guides/basic-concepts](https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts)

### TanStack Form Form-Level State (via `form.Subscribe` or `useSelector`)

| Property | Type | Description |
|---|---|---|
| `state.values` | object | All field values |
| `state.canSubmit` | boolean | Form is valid and ready |
| `state.isSubmitting` | boolean | Currently submitting |
| `state.isPristine` | boolean | No fields modified |
| `state.isValid` | boolean | No validation errors |
| `state.errorMap` | object | Form-level errors by trigger |

`canSubmit` is `false` when any field is invalid **and** the form has been touched. Before any interaction, `canSubmit` is `true` even if fields are technically invalid.

Source: [tanstack.com/form/v1/docs/framework/react/guides/validation](https://tanstack.com/form/v1/docs/framework/react/guides/validation)

---

## 6. Developer Experience

### DevTools

**React Hook Form DevTools:**

```tsx
import { DevTool } from "@hookform/devtools"

function App() {
  const { control } = useForm({ mode: "onChange" })
  return (
    <>
      <form>{/* ... */}</form>
      <DevTool control={control} />
    </>
  )
}
```

Install: `npm install -D @hookform/devtools`

Features: read input values and form state in real-time, visual valid/invalid indicators, search for registered inputs, "Native" button to locate inputs in the DOM, "Update" button to refresh (needed because values live in refs, not state).

Source: [react-hook-form.com/dev-tools](https://react-hook-form.com/dev-tools)

**TanStack Form DevTools:**

Integrates with the broader TanStack DevTools ecosystem (shared with TanStack Query, Router, etc.). Uses `@tanstack/devtools-event-client` internally.

Source: [tanstack.com/form/latest](https://tanstack.com/form/latest)

### Error Messages and Debugging

| Aspect | React Hook Form | TanStack Form |
|---|---|---|
| Error format | `{ type: string, message: string, ref: element }` | String, string array, or typed object |
| Error location | `formState.errors.fieldName` | `field.state.meta.errors` or `field.state.meta.errorMap` |
| Multiple errors per field | `criteriaMode: "all"` | Always collected (multiple validators per trigger) |
| Form-level errors | Via `setError("root", ...)` | Via `state.errorMap` |

### Learning Curve

**React Hook Form**: Lower barrier to entry. `register` + `handleSubmit` gets you a working form in 5 lines. The uncontrolled model matches how native HTML forms work. However, `Controller`, `useWatch`, `useFieldArray`, and the Proxy-based `formState` add complexity for advanced cases.

**TanStack Form**: Steeper initial learning curve. Every field requires explicit value/handler wiring (no `{...register()}` shortcut). The render-prop pattern and selector-based subscriptions are less familiar. However, the model is consistent -- there is no "easy path" vs "complex path" split.

### Boilerplate Comparison

For a single text input:

| Step | React Hook Form | TanStack Form |
|---|---|---|
| Field registration | `<input {...register("name")} />` | `<form.Field name="name" children={(field) => <input value={field.state.value} onChange={e => field.handleChange(e.target.value)} onBlur={field.handleBlur} />} />` |
| Lines of code | 1 | 5+ |
| Controlled component | `<Controller name="x" control={control} render={({field}) => <Input {...field} />} />` | Same as above (all fields are controlled) |

React Hook Form is significantly more concise for simple native inputs. The gap narrows for controlled components (both use render-props). TanStack Form's verbosity makes data flow explicit.

---

## 7. Shadcn UI Integration

Both libraries now use the same Shadcn primitive components (`<Field>`, `<FieldLabel>`, `<FieldError>`, `<FieldDescription>`, `<FieldGroup>`). Shadcn no longer provides a `<Form>` wrapper component for either library.

**React Hook Form + Shadcn:**

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

**TanStack Form + Shadcn:**

```tsx
<form.Field
  name="title"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
        <Input
          id={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    )
  }}
/>
```

| Aspect | React Hook Form | TanStack Form |
|---|---|---|
| Field wrapper | `<Controller>` | `<form.Field>` |
| Value binding | `{...field}` spread | Explicit `value`, `onChange`, `onBlur` |
| Error access | `fieldState.invalid`, `fieldState.error` | `field.state.meta.isTouched && !field.state.meta.isValid`, `field.state.meta.errors` |
| Invalid styling | `data-invalid={fieldState.invalid}` | `data-invalid={isInvalid}` (computed) |
| Install command | `npm i react-hook-form @hookform/resolvers zod` | `npm i @tanstack/react-form zod` |
| Array fields | `useFieldArray` hook | `mode="array"` on `<form.Field>` with `pushValue`/`removeValue` |

Sources: [ui.shadcn.com/docs/forms/react-hook-form](https://ui.shadcn.com/docs/forms/react-hook-form), [ui.shadcn.com/docs/forms/tanstack-form](https://ui.shadcn.com/docs/forms/tanstack-form)

---

## 8. Bundle Size

Measured from npm packages (unminified ESM, gzipped). Actual production size depends on tree-shaking and minification.

| Package | ESM (unminified) | Gzipped |
|---|---|---|
| **react-hook-form** | 130 KB | ~25.7 KB |
| **@tanstack/react-form** | 17 KB | ~3.0 KB |
| + @tanstack/form-core | 133 KB | ~23.7 KB |
| + @tanstack/store | 14 KB | ~3.3 KB |
| + @tanstack/pacer-lite | 27 KB | ~6.1 KB |
| + @tanstack/devtools-event-client | 8 KB | ~2.2 KB |
| **TanStack total (all deps)** | **199 KB** | **~38.3 KB** |

React Hook Form has zero runtime dependencies. TanStack Form pulls in four packages from the TanStack ecosystem (though many are tree-shakeable and may already be in your bundle if you use other TanStack libraries).

**React Hook Form is smaller in total.** The gap narrows if your app already depends on `@tanstack/store` (used by TanStack Query, Router, etc.).

Sources: npm registry, measured 2026-07-28.

---

## 9. Ecosystem and Maturity

| Factor | React Hook Form | TanStack Form |
|---|---|---|
| Age | 7+ years (March 2019) | 3 years (April 2023 as @tanstack) |
| npm weekly downloads | 57.6M | 2.4M |
| GitHub stars | 44.8K | 6.6K |
| Open issues | 9 | 162 |
| Release cadence | ~1,094 versions (very active) | ~243 versions (active) |
| DevTools | `@hookform/devtools` | TanStack DevTools integration |
| Framework scope | React only | 7 frameworks |
| Major backers | Independent / community | TanStack (Tanner Linsley), sponsored by Cloudflare, Netlify, etc. |
| Industry recognition | JS Rising Star, GitNation React OS Award, Thoughtworks Radar (2025) | Part of the broader TanStack ecosystem (Query, Router, Table) |
| Resolver ecosystem | 8+ schema library adapters via `@hookform/resolvers` | Standard Schema spec (Zod, Valibot, ArkType, Effect natively) |
| Community resources | Massive (tutorials, SO answers, blog posts, courses) | Growing (official docs, fewer third-party resources) |

React Hook Form is the established incumbent with a massive community. TanStack Form is newer and growing, backed by the credibility of the TanStack ecosystem.

Sources: npm registry, GitHub API, [react-hook-form.com](https://react-hook-form.com/), [tanstack.com/form](https://tanstack.com/form/latest)

---

## 10. Complete useForm API Comparison

| Option / Return | React Hook Form | TanStack Form |
|---|---|---|
| **Default values** | `defaultValues: T \| () => Promise<T>` | `defaultValues: T` |
| **Async default values** | Supported natively | Not built-in |
| **Validation mode** | `mode: "onSubmit" \| "onChange" \| "onBlur" \| "onTouched" \| "all"` | Per-field via `validators` |
| **Re-validation mode** | `reValidateMode: "onChange" \| "onBlur" \| "onSubmit"` | N/A (per-trigger) |
| **Schema resolver** | `resolver: zodResolver(schema)` | `validators: { onChange: schema }` |
| **Submit handler** | `handleSubmit(onValid, onInvalid)` (called on `<form onSubmit>`) | `onSubmit: async ({ value }) => ...` (declared on `useForm`) |
| **Register field** | `register(name, options)` | `<form.Field name={name}>` |
| **Controlled field** | `<Controller>` | Same as all fields (controlled by default) |
| **Watch values** | `watch(name?)` | `useSelector(form.store, selector)` |
| **Get values (no re-render)** | `getValues(name?)` | Direct store access |
| **Set value** | `setValue(name, value, options)` | `form.setFieldValue(name, value)` |
| **Set error** | `setError(name, error)` | Return from form-level validator |
| **Clear errors** | `clearErrors(name?)` | N/A (errors clear when validation passes) |
| **Trigger validation** | `trigger(name?)` | `form.validateField(name)` |
| **Reset** | `reset(values?, options?)` (12 keep options) | `form.reset()` (resets to defaultValues) |
| **Form state** | `formState` (Proxy-based) | `form.Subscribe` / `useSelector` |
| **Field array** | `useFieldArray({ name, control })` | `<form.Field mode="array">` |
| **Context** | `FormProvider` + `useFormContext` | Pass `form` object as prop |
| **Focus field** | `setFocus(name)` | N/A |
| **Unregister** | `unregister(name)` | N/A (fields tracked by mount/unmount) |
| **Disabled form** | `disabled: true` option | N/A |
| **Native validation** | `shouldUseNativeValidation: true` | N/A |
| **Delay error** | `delayError: ms` | N/A |
| **Criteria mode** | `criteriaMode: "all"` (multiple errors) | Multiple validators per field (always collected) |
| **Listeners / side effects** | `watch` + `useEffect` | `listeners: { onChange, onBlur, onMount, onSubmit, onUnmount }` |
| **Linked fields** | `deps` option on `register` | `onChangeListenTo` / `onBlurListenTo` on validators |

---

## 11. When to Pick Which

### Choose React Hook Form when:

- **You want the most battle-tested option.** 7 years of production use, 57M weekly downloads, near-zero open issues.
- **Bundle size matters.** Zero dependencies, smaller total footprint.
- **You use native HTML inputs heavily.** The `register()` spread is the most concise API for standard `<input>` elements.
- **You need the largest ecosystem.** More tutorials, Stack Overflow answers, third-party integrations, and community resources.
- **Maximum re-render avoidance is critical.** Ref-based approach means field components literally never re-render on value changes.
- **You need granular reset control.** 12 `keep*` options on `reset()` for preserving specific state slices.
- **You want native HTML validation.** `shouldUseNativeValidation` enables browser-native constraint validation with `:valid`/`:invalid` CSS selectors.

### Choose TanStack Form when:

- **You want best-in-class TypeScript inference.** End-to-end type safety from field names through submit handlers, no string-path gaps.
- **Async validation is a core requirement.** Built-in debouncing, per-field async validators, sync-before-async gating, and loading states are first-class.
- **You already use the TanStack ecosystem.** If you have `@tanstack/store` in your bundle (via Query or Router), the marginal cost is smaller.
- **You need multi-framework support.** Same form model works in Vue, Angular, Solid, Svelte, Lit, and Preact.
- **You prefer explicit data flow.** Controlled fields with visible `value`/`onChange` wiring, no ref magic.
- **You want declarative side effects.** The `listeners` API and `onChangeListenTo` are cleaner than `watch` + `useEffect` for field dependencies.
- **You need per-field validation timing.** Different validators for different triggers on each field, without a global mode setting.
- **You want form-level validators that target specific fields.** Returning `{ fields: { name: "error" } }` from a form-level validator is ergonomic for server validation responses.
- **You want typed error objects.** Validators can return structured objects, not just strings.

### Either works well when:

- Using Shadcn UI (both have official integration guides with nearly identical patterns).
- Using Zod for schema validation.
- Building standard CRUD forms.

---

## Sources

| Source | URL |
|---|---|
| React Hook Form homepage | https://react-hook-form.com/ |
| React Hook Form get-started | https://react-hook-form.com/get-started |
| React Hook Form useForm API | https://react-hook-form.com/docs/useform |
| React Hook Form register API | https://react-hook-form.com/docs/useform/register |
| React Hook Form formState API | https://react-hook-form.com/docs/useform/formstate |
| React Hook Form watch API | https://react-hook-form.com/docs/useform/watch |
| React Hook Form getValues API | https://react-hook-form.com/docs/useform/getvalues |
| React Hook Form setValue API | https://react-hook-form.com/docs/useform/setvalue |
| React Hook Form reset API | https://react-hook-form.com/docs/useform/reset |
| React Hook Form useFieldArray API | https://react-hook-form.com/docs/usefieldarray |
| React Hook Form useFormContext API | https://react-hook-form.com/docs/useformcontext |
| React Hook Form DevTools | https://react-hook-form.com/dev-tools |
| TanStack Form homepage | https://tanstack.com/form/latest |
| TanStack Form overview | https://tanstack.com/form/latest/docs/overview |
| TanStack Form basic concepts | https://tanstack.com/form/v1/docs/framework/react/guides/basic-concepts |
| TanStack Form validation guide | https://tanstack.com/form/v1/docs/framework/react/guides/validation |
| TanStack Form array fields | https://tanstack.com/form/v1/docs/framework/react/guides/arrays |
| TanStack Form linked fields | https://tanstack.com/form/v1/docs/framework/react/guides/linked-fields |
| TanStack Form listeners | https://tanstack.com/form/v1/docs/framework/react/guides/listeners |
| Shadcn: React Hook Form | https://ui.shadcn.com/docs/forms/react-hook-form |
| Shadcn: TanStack Form | https://ui.shadcn.com/docs/forms/tanstack-form |
| npm registry (react-hook-form) | https://www.npmjs.com/package/react-hook-form |
| npm registry (@tanstack/react-form) | https://www.npmjs.com/package/@tanstack/react-form |
| GitHub (react-hook-form) | https://github.com/react-hook-form/react-hook-form |
| GitHub (TanStack/form) | https://github.com/TanStack/form |
