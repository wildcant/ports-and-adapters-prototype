import type { FilterDef, FilterValue } from '../types'

export function formatDisplayValue(value: FilterValue | null, def: FilterDef): string {
  if (value === null) return ''
  switch (def.type) {
    case 'radio':
    case 'select':
      return def.options.find((o) => o.value === value)?.label ?? String(value)
    case 'multiselect': {
      if (!Array.isArray(value)) return String(value)
      return value.map((v: string) => def.options.find((o) => o.value === v)?.label ?? v).join(', ')
    }
    case 'date': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
      const preset = def.presets?.find((p) => p.value.$gte === value.$gte && p.value.$lte === value.$lte)
      if (preset) return preset.label
      return formatDateRange(value)
    }
  }
}

function formatDateRange(value: { $gte?: string; $lte?: string }): string {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (value.$gte && value.$lte) return `${fmt(value.$gte)} - ${fmt(value.$lte)}`
  if (value.$gte) return `After ${fmt(value.$gte)}`
  if (value.$lte) return `Before ${fmt(value.$lte)}`
  return ''
}
