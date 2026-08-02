import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to Proteus</h1>
      <p className="text-sm text-muted-foreground">Authentication coming soon.</p>
    </div>
  )
}
