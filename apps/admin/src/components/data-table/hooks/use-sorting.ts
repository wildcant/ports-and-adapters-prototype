import { useMemo } from 'react'
import type { ColumnDef } from '../types'
import type { UrlState } from './use-url-state'

export function useSorting<T>(columns: ColumnDef<T>[], urlState: UrlState) {
  const sortableColumns = useMemo(() => columns.filter((c) => c.sortable), [columns])

  const current = useMemo(() => {
    if (!urlState.order) return null
    const desc = urlState.order.startsWith('-')
    const field = desc ? urlState.order.slice(1) : urlState.order
    return { field, desc }
  }, [urlState.order])

  const setField = (field: string) => {
    urlState.setOrder(current?.desc ? `-${field}` : field)
  }

  const setDirection = (desc: boolean) => {
    if (!current?.field) return
    urlState.setOrder(desc ? `-${current.field}` : current.field)
  }

  return { sortableColumns, current, setField, setDirection }
}
