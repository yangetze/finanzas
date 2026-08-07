import { cn } from '@/lib/utils'

interface MiniBarChartProps {
  points: { label: string; value: number }[]
  colorClass?: string
}

export function MiniBarChart({ points, colorClass = 'bg-gold' }: MiniBarChartProps) {
  const max = Math.max(...points.map((p) => p.value), 0)
  return (
    <div className="flex items-end gap-2 h-20">
      {points.map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
          <div className="w-full flex-1 flex items-end justify-center">
            <div
              className={cn('w-full rounded-t transition-all', colorClass, p.value <= 0 && 'opacity-20')}
              style={{ height: max > 0 ? `${Math.max((p.value / max) * 100, p.value > 0 ? 4 : 2)}%` : '2%' }}
            />
          </div>
          <span className="text-[10px] font-ui text-ink-faint shrink-0">{p.label}</span>
        </div>
      ))}
    </div>
  )
}
