import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@proteus/ui'
import { Link } from '@tanstack/react-router'
import { EllipsisIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Action = {
  icon: ReactNode
  label: string
} & ({ to: string; onClick?: never } | { onClick: () => void; to?: never })

type ActionGroup = {
  actions: Action[]
}

type ActionMenuProps = {
  groups: ActionGroup[]
}

export function ActionMenu({ groups }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {groups.map((group, groupIndex) => {
          if (!group.actions.length) return null

          const isLast = groupIndex === groups.length - 1

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: groups are static, no stable id
            <DropdownMenuGroup key={groupIndex}>
              {group.actions.map((action) => {
                if (action.onClick) {
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick()
                      }}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  )
                }

                return (
                  <DropdownMenuItem key={action.label} render={<Link to={action.to} />}>
                    {action.icon}
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                )
              })}
              {!isLast && <DropdownMenuSeparator />}
            </DropdownMenuGroup>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
