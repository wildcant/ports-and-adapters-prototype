import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import type { FilterDef, FilterValue } from '../types'

type UrlStateConfig = {
  prefix?: string
  filterDefs: FilterDef[]
}

export function useUrlState({ prefix, filterDefs }: UrlStateConfig) {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()

  const prefixed = useCallback((name: string) => (prefix ? `${prefix}_${name}` : name), [prefix])

  const update = useCallback(
    (patch: Record<string, unknown>) =>
      navigate({ to: '.', search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) }),
    [navigate],
  )

  const updateAndResetPage = useCallback(
    (patch: Record<string, unknown>) => update({ ...patch, [prefixed('offset')]: undefined }),
    [update, prefixed],
  )

  const offset = (search[prefixed('offset')] as number) ?? 0
  const order = search[prefixed('order')] as string | undefined
  const q = (search[prefixed('q')] as string) ?? ''

  const filters = useMemo(
    () =>
      Object.fromEntries(
        filterDefs.map((f) => [f.id, search[prefixed(f.id)]] as const).filter(([, value]) => value != null),
      ) as Record<string, FilterValue>,
    [filterDefs, search, prefixed],
  )

  return useMemo(
    () => ({
      offset,
      order,
      q,
      filters,
      setOffset: (v: number) => update({ [prefixed('offset')]: v || undefined }),
      setOrder: (v: string | null) => updateAndResetPage({ [prefixed('order')]: v ?? undefined }),
      setSearch: (v: string) => updateAndResetPage({ [prefixed('q')]: v || undefined }),
      setFilter: (id: string, v: FilterValue | null) => updateAndResetPage({ [prefixed(id)]: v ?? undefined }),
    }),
    [offset, order, q, filters, update, updateAndResetPage, prefixed],
  )
}

export type UrlState = ReturnType<typeof useUrlState>
