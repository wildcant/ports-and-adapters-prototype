import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@proteus/ui'
import { Link, useMatches } from '@tanstack/react-router'
import { Fragment } from 'react'

export function Breadcrumbs() {
  const matches = useMatches()

  const crumbs = matches
    .filter((m) => m.staticData?.breadcrumb || (m.context as Record<string, unknown>)?.breadcrumb)
    .map((m) => ({
      label: ((m.context as Record<string, unknown>)?.breadcrumb as string) ?? m.staticData?.breadcrumb ?? '',
      path: m.pathname,
    }))

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <Fragment key={crumb.path}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={crumb.path as '/'} />}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
