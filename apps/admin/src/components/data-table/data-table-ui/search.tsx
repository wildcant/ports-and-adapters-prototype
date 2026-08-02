import { Input } from '@proteus/ui'
import { SearchIcon } from 'lucide-react'
import { SearchSkeleton } from './skeleton'

type SearchProps = {
  value: string
  onChange: (value: string) => void
  isPending: boolean
}

export function Search({ value, onChange, isPending }: SearchProps) {
  if (isPending) return <SearchSkeleton />

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-40 pl-7 text-xs"
      />
    </div>
  )
}
