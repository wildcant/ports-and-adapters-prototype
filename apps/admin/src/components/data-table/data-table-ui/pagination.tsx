import { Button } from '@proteus/ui'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { PaginationSkeleton } from './skeleton'

type PaginationProps = {
  currentPage: number
  totalPages: number | undefined
  canPrev: boolean
  canNext: boolean
  goNext: () => void
  goPrev: () => void
  isPending: boolean
}

export function Pagination({ currentPage, totalPages, canPrev, canNext, goNext, goPrev, isPending }: PaginationProps) {
  if (isPending) return <PaginationSkeleton />

  const pageInfo = totalPages != null ? `Page ${currentPage + 1} of ${totalPages}` : `Page ${currentPage + 1}`

  return (
    <div className="flex items-center justify-between border-t px-6 py-3">
      <span className="text-sm text-muted-foreground">{pageInfo}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={!canPrev} onClick={goPrev}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" size="icon-sm" disabled={!canNext} onClick={goNext}>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
