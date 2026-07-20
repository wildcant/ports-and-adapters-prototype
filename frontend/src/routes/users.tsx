import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { createUser, deleteUser as deleteUserFn, listUsers, updateUser as updateUserFn } from '../server/users'

export const Route = createFileRoute('/users')({
  component: UsersPage,
  loader: () => listUsers(),
})

function UsersPage() {
  const initialUsers = Route.useLoaderData()
  const [{ users }, setUsers] = useState(initialUsers)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  async function refresh() {
    setUsers(await listUsers())
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    await createUser({ data: { name, email } })
    setName('')
    setEmail('')
    await refresh()
  }

  function startEditing(user: { id: string; name: string; email: string }) {
    setEditingId(user.id)
    setEditName(user.name)
    setEditEmail(user.email)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    await updateUserFn({ data: { id: editingId, name: editName, email: editEmail } })
    setEditingId(null)
    await refresh()
  }

  async function handleDelete(id: string) {
    await deleteUserFn({ data: { id } })
    await refresh()
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">User Module</p>
        <h1 className="display-title mb-5 text-4xl font-bold tracking-tight text-[var(--sea-ink)]">Users</h1>
        <p className="mb-6 text-[var(--sea-ink-soft)]">
          Using <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">createServerFn</code> — calls the backend
          service directly, no HTTP round-trip
        </p>

        <form onSubmit={addUser} className="mb-8 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            Add User
          </button>
        </form>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="island-shell flex items-center justify-between rounded-xl p-4">
              {editingId === user.id ? (
                <form onSubmit={saveEdit} className="flex flex-1 flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
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
                    <p className="font-semibold text-[var(--sea-ink)]">{user.name}</p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(user)}
                      className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-1.5 text-xs font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-sm text-[var(--sea-ink-soft)]">No users yet. Add one above.</p>
          )}
        </div>
      </section>
    </main>
  )
}
