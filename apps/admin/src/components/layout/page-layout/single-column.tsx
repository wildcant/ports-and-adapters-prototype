import { cn } from '@proteus/ui'
import { Outlet } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
  className?: string
}

export function SingleColumn({ children, className }: LayoutProps) {
  return (
    <>
      <div className={cn('flex flex-col gap-y-3', className)}>{children}</div>
      <Outlet />
    </>
  )
}
