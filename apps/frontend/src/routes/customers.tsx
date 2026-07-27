import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { Customer } from '#/api/generated/admin/model'
import {
  getCustomersQueryOptions,
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from '#/features/customers/api/customers'

const PAGE_SIZE = 5

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(getCustomersQueryOptions({ limit: PAGE_SIZE, offset: 0 })),
})

function CustomersPage() {
  const [offset, setOffset] = useState(0)
  const { customers = [], count = 0, limit = PAGE_SIZE } = useCustomers({ limit: PAGE_SIZE, offset })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const deleteMutation = useDeleteCustomer()

  function addCustomer(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate([{ firstName, lastName, email }])
    setFirstName('')
    setLastName('')
    setEmail('')
  }

  function startEditing(customer: Customer) {
    setEditingId(customer.id)
    setEditFirstName(customer.firstName)
    setEditLastName(customer.lastName)
    setEditEmail(customer.email)
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    updateMutation.mutate(
      { id: editingId, data: { firstName: editFirstName, lastName: editLastName, email: editEmail } },
      { onSuccess: () => setEditingId(null) },
    )
  }

  function handleDelete(id: string) {
    deleteMutation.mutate({ id })
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">Customer Module</p>
        <h1 className="display-title mb-5 text-4xl font-bold tracking-tight text-[var(--sea-ink)]">Customers</h1>
        <p className="mb-6 text-[var(--sea-ink-soft)]">
          Using generated <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">React Query</code> hooks — calls
          the JSON API over HTTP
        </p>

        <form onSubmit={addCustomer} className="mb-8 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="rounded-lg border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="rounded-lg border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            Add Customer
          </button>
        </form>

        <div className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="island-shell flex items-center justify-between rounded-xl p-4">
              {editingId === customer.id ? (
                <form onSubmit={saveEdit} className="flex flex-1 flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    className="rounded-lg border border-[rgba(23,58,64,0.2)] bg-white/50 px-3 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                    className="rounded-lg border border-[rgba(23,58,64,0.2)] bg-white/50 px-3 py-1.5 text-sm"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="rounded-lg border border-[rgba(23,58,64,0.2)] bg-white/50 px-3 py-1.5 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-1.5 text-xs font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-[var(--sea-ink)]">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">{customer.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(customer)}
                      className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-1.5 text-xs font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(customer.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {customers.length === 0 && (
            <p className="text-center text-sm text-[var(--sea-ink-soft)]">No customers yet. Add one above.</p>
          )}
        </div>

        {count > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-[var(--sea-ink-soft)]">
            <span>
              Showing {offset + 1}–{Math.min(offset + limit, count)} of {count}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="rounded-full border border-[rgba(23,58,64,0.2)] px-4 py-1.5 text-xs font-semibold transition hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={offset + limit >= count}
                onClick={() => setOffset(offset + limit)}
                className="rounded-full border border-[rgba(23,58,64,0.2)] px-4 py-1.5 text-xs font-semibold transition hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
