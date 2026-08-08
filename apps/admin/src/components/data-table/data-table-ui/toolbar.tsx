import type { ReactNode } from 'react'

type ToolbarProps = {
  children: ReactNode
}

type ToolbarRowProps = {
  children: ReactNode
}

type ToolbarSectionProps = {
  children: ReactNode
  position: 'left' | 'right'
}

function ToolbarRow({ children }: ToolbarRowProps) {
  return <div className="flex items-center justify-between py-2 first:pt-4 last:border-b">{children}</div>
}

function ToolbarSection({ children, position }: ToolbarSectionProps) {
  return <div className={`flex items-center gap-2 ${position === 'right' ? 'ml-auto' : ''}`}>{children}</div>
}

function Toolbar({ children }: ToolbarProps) {
  return <div>{children}</div>
}

export { Toolbar, ToolbarRow, ToolbarSection }
