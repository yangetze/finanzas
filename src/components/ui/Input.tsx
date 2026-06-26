import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({ label, error, helper, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-muted font-ui">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full bg-canvas-soft border border-border rounded-lg px-3 py-2 text-sm text-ink font-mono',
          'placeholder:text-ink-faint',
          'focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-coral/60 focus:ring-coral/40',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-coral font-ui">{error}</p>}
      {helper && !error && <p className="text-xs text-ink-faint font-ui">{helper}</p>}
    </div>
  )
}
