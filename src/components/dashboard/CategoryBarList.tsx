import { formatCurrency } from '@/lib/utils'

export interface CategoryBarRow {
  key: string
  name: string
  emoji: string | null
  spent: number
  symbol: string
}

export function CategoryBarList({ rows }: { rows: CategoryBarRow[] }) {
  const max = Math.max(...rows.map((r) => r.spent), 0)
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs font-ui">
            <span className="text-ink truncate">
              {r.emoji ? `${r.emoji} ` : ''}
              {r.name}
            </span>
            <span className="text-ink-faint font-mono shrink-0">{formatCurrency(r.spent, r.symbol)}</span>
          </div>
          <div className="w-full h-1.5 bg-canvas-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${max > 0 ? (r.spent / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
