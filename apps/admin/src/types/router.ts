import '@tanstack/history'
import '@tanstack/react-router'

declare module '@tanstack/history' {
  interface HistoryState {
    isSubmitSuccessful?: boolean
  }
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?: string
  }
}
