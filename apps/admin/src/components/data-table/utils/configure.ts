import type { CellRenderer } from '../types'

type DataTableGlobalConfig = {
  renderers?: Record<string, CellRenderer>
}

const globalConfig: DataTableGlobalConfig = {
  renderers: {},
}

export function configureDataTable(config: DataTableGlobalConfig) {
  if (config.renderers) {
    globalConfig.renderers = { ...globalConfig.renderers, ...config.renderers }
  }
}

export function getRenderer(name: string): CellRenderer | undefined {
  return globalConfig.renderers?.[name]
}
