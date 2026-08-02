import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useRowNavigation() {
  const navigate = useNavigate()

  return useCallback(
    (event: React.MouseEvent, href: string) => {
      const target = event.target as HTMLElement
      if (target.closest('button, a, input, select, textarea, [role="menuitem"]')) return

      if (event.metaKey || event.ctrlKey || event.button === 1) {
        window.open(href, '_blank', 'noreferrer')
        return
      }
      if (event.shiftKey) {
        window.open(href, undefined, 'noreferrer')
        return
      }
      navigate({ to: href })
    },
    [navigate],
  )
}
