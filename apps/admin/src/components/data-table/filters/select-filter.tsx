import { cn } from '@proteus/ui'
import { CheckIcon } from 'lucide-react'

type SelectFilterProps = {
  options: { label: string; value: string }[]
  value: string | undefined
  onChange: (value: string) => void
}

export function SelectFilter({ options, value, onChange }: SelectFilterProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
            opt.value === value && 'bg-accent',
          )}
        >
          {opt.label}
          {opt.value === value && <CheckIcon className="size-3.5 text-primary" />}
        </button>
      ))}
    </div>
  )
}
