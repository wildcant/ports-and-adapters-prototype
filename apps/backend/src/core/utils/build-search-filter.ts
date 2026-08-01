import type { FilterRecord } from './build-filters.js'

export function buildSearchFilter(q: string, searchableColumns: string[]): FilterRecord {
  const tokens = q.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0 || searchableColumns.length === 0) return {}

  return {
    $and: tokens.map((token) => ({
      $or: searchableColumns.map((col) => ({
        [col]: { $ilike: `%${token}%` },
      })),
    })),
  } as FilterRecord
}
