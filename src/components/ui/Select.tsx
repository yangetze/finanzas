import { cn } from '@/lib/utils'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helper?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  helper,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink-muted font-ui">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-canvas-soft border border-border rounded-lg px-3 py-2 text-sm text-ink font-mono',
          'focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-coral/60 focus:ring-coral/40',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-coral font-ui">{error}</p>}
      {helper && !error && <p className="text-xs text-ink-faint font-ui">{helper}</p>}
    </div>
  )
}
