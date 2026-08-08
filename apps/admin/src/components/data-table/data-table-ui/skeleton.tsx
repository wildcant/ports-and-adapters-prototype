import { Skeleton } from '@proteus/ui'

export function TableSkeleton({ columnCount, rowCount = 5 }: { columnCount: number; rowCount?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rowCount }, (_, i) => (
        <div key={`row-${i}`} className="flex gap-4">
          {Array.from({ length: columnCount }, (_, j) => (
            <Skeleton key={`col-${j}`} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function PaginationSkeleton() {
  return <Skeleton className="h-7 w-48" />
}
