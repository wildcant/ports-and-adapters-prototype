import { formatDate, formatDatetime } from '@proteus/utils'
import { configureDataTable } from '#/components/data-table'

export function setupDataTable() {
  configureDataTable({
    renderers: {
      text: ({ value }) => (value != null ? String(value) : ''),
      datetime: ({ value }) => {
        if (!value || typeof value === 'boolean') return ''
        return formatDatetime(value)
      },
      date: ({ value }) => {
        if (!value || typeof value === 'boolean') return ''
        return formatDate(value)
      },
      boolean: ({ value }) => (value ? 'Yes' : 'No'),
    },
  })
}
