import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-gold' : 'bg-canvas-muted',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-canvas shadow-lg transform transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && <span className="text-sm font-medium text-ink font-ui">{label}</span>}
          {description && <span className="text-xs text-ink-faint font-ui">{description}</span>}
        </div>
      )}
    </div>
  )
}
