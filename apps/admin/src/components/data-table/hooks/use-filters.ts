import { useCallback, useState } from 'react'
import type { FilterDef, FilterValue } from '../types'
import type { UrlState } from './use-url-state'

export function useFilters(urlState: UrlState, filterDefs: FilterDef[]) {
  // Filters added from the menu but not yet given a value.
  // Kept separate from URL state so empty values don't hit schema validation.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const add = useCallback((id: string) => {
    setPendingIds((prev) => new Set(prev).add(id))
  }, [])

  const commit = useCallback(
    (id: string, value: FilterValue) => {
      urlState.setFilter(id, value)
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [urlState],
  )

  const remove = useCallback(
    (id: string) => {
      urlState.setFilter(id, null)
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [urlState],
  )

  const clearAll = useCallback(() => {
    for (const f of filterDefs) urlState.setFilter(f.id, null)
    setPendingIds(new Set())
  }, [filterDefs, urlState])

  const activeIds = [...Object.keys(urlState.filters), ...pendingIds]

  return { pendingIds, activeIds, add, commit, remove, clearAll }
}
