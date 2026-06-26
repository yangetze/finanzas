import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  current: number
  total: number
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2" aria-label={`Paso ${current} de ${total}`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            step === current
              ? 'w-6 bg-gold'
              : step < current
                ? 'w-3 bg-gold/60'
                : 'w-3 bg-canvas-muted',
          )}
        />
      ))}
      <span className="text-xs text-ink-faint font-ui ml-1">
        {current}/{total}
      </span>
    </div>
  )
}
