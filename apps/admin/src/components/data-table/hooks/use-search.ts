import { useEffect, useState } from 'react'
import type { UrlState } from './use-url-state'

export function useTableSearch(urlState: UrlState, delay = 300) {
  const [draft, setDraft] = useState(urlState.q)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== urlState.q) {
        urlState.setSearch(draft)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [draft, delay, urlState])

  // Sync back when URL changes externally (e.g. browser back)
  useEffect(() => {
    setDraft(urlState.q)
  }, [urlState.q])

  return { value: draft, onChange: setDraft }
}
