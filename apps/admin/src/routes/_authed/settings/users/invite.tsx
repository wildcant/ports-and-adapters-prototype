import { createFileRoute } from '@tanstack/react-router'
import { RouteFocusModal } from '#/components/modals/route-focus-modal/route-focus-modal'
import { InviteForm } from '#/features/users/components/invite-form'

export const Route = createFileRoute('/_authed/settings/users/invite')({
  component: InviteRoute,
})

function InviteRoute() {
  return (
    <RouteFocusModal>
      <InviteForm />
    </RouteFocusModal>
  )
}
