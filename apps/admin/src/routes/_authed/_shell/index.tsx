import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/_shell/')({ component: Home })

function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Welcome to Proteus Admin.</p>
    </div>
  )
}
