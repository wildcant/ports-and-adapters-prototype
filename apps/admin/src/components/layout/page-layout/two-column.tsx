import { cn } from '@proteus/ui'
import { Outlet } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
  className?: string
}

function Main({ children, className }: LayoutProps) {
  return <div className={cn('flex w-full min-w-0 flex-col gap-y-3', className)}>{children}</div>
}

function Side({ children, className }: LayoutProps) {
  return <div className={cn('flex w-full flex-col gap-y-3 xl:mt-0', className)}>{children}</div>
}

export function TwoColumn({ children, className }: LayoutProps) {
  return (
    <>
      <div
        className={cn(
          'flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,1fr)_440px]',
          className,
        )}
      >
        {children}
      </div>
      <Outlet />
    </>
  )
}

TwoColumn.Main = Main
TwoColumn.Side = Side
