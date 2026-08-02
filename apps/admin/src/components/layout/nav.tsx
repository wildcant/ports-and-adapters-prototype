import { PackageIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type NavItem = {
  label: string
  to: string
  icon: ReactNode
}

export const navItems: NavItem[] = [{ label: 'Products', to: '/products', icon: <PackageIcon /> }]
