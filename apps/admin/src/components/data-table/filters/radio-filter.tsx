import { cn } from '@proteus/ui'

type RadioFilterProps = {
  options: { label: string; value: string }[]
  value: string | undefined
  onChange: (value: string) => void
}

export function RadioFilter({ options, value, onChange }: RadioFilterProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
            opt.value === value && 'bg-accent',
          )}
        >
          <span
            className={cn('size-1.5 rounded-full', opt.value === value ? 'bg-primary' : 'bg-muted-foreground/30')}
          />
          {opt.label}
        </button>
      ))}
    </div>
  )
}
