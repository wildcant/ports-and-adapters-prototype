import { createFileRoute } from '@tanstack/react-router'
import { Shell } from '#/components/layout/shell'

export const Route = createFileRoute('/_authed/_shell')({
  component: Shell,
})
