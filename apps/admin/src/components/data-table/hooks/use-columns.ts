import type { ColumnDef as TanStackColumnDef } from '@tanstack/react-table'
import { type ReactNode, useMemo } from 'react'
import type { CellValue, ColumnDef } from '../types'
import { getRenderer } from '../utils/configure'

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

export function useColumns<T>(columns: ColumnDef<T>[], rowActions?: (row: T) => ReactNode) {
  return useMemo<TanStackColumnDef<T>[]>(() => {
    const cols: TanStackColumnDef<T>[] = columns.map(({ accessorKey, ...col }) => ({
      id: col.id,
      accessorFn: accessorKey ? (row: T) => getNestedValue(row as Record<string, unknown>, accessorKey) : undefined,
      header: col.header,
      size: col.size,
      minSize: col.minSize,
      maxSize: col.maxSize,
      meta: { align: col.align, truncateTooltip: col.truncateTooltip },
      // Cell resolution priority: inline cell fn → named render string → plain text.
      // Order matters — inline always wins so consumers can override global renderers per-column.
      cell: (info) => {
        const value = info.getValue() as CellValue
        const row = info.row.original

        if (col.cell) return col.cell({ value, row })

        if (col.render) {
          const renderer = getRenderer(col.render)
          if (renderer) return renderer({ value })
        }

        if (value == null) return ''
        return String(value)
      },
    }))

    if (rowActions) {
      cols.push({
        id: '_actions',
        header: '',
        size: 50,
        meta: { align: 'right' as const, truncateTooltip: false },
        cell: (info) => rowActions(info.row.original),
      })
    }

    return cols
  }, [columns, rowActions])
}
