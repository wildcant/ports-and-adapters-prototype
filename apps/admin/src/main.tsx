import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { setupDataTable } from './components/data-table/config'
import { getRouter } from './router'

setupDataTable()

const router = getRouter()

const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
