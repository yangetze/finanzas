import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  colorClass?: string
}

export function ProgressBar({ value, max, className, colorClass }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const defaultColor = pct >= 100 ? 'bg-coral' : pct >= 80 ? 'bg-amber-fin' : 'bg-sage'
  return (
    <div className={cn('w-full h-1.5 bg-canvas-muted rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all', colorClass ?? defaultColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
