import { ChevronDown, Pencil, PiggyBank, PowerOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'
import type { Envelope, SpendingType } from '@/types'

const SPEND_LABELS: Record<SpendingType, string> = {
  supervivencia: 'Supervivencia',
  flexible: 'Flexible',
  crecimiento: 'Crecimiento',
}

const SPEND_COLORS: Record<SpendingType, string> = {
  supervivencia: 'bg-coral/20 text-coral',
  flexible: 'bg-amber-fin/20 text-amber-fin',
  crecimiento: 'bg-gold/20 text-gold',
}

export type EnvelopeStats =
  | { kind: 'monthly'; available: number; budget: number; symbol: string }
  | { kind: 'savings'; accumulated: number; monthAllocated: number; symbol: string }

interface EnvelopeCardProps {
  envelope: Envelope
  subCount: number
  isExpanded?: boolean
  onToggle?: () => void
  stats?: EnvelopeStats
  onEdit: (envelope: Envelope) => void
  onDeactivate: (id: string) => void
}

function fmt(amount: number, symbol: string) {
  const sign = amount < 0 ? '-' : ''
  return `${sign}${symbol} ${Math.abs(amount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function EnvelopeCard({ envelope, subCount, isExpanded, onToggle, stats, onEdit, onDeactivate }: EnvelopeCardProps) {
  const isGroup = envelope.parentId === null
  const collapsible = isGroup && subCount > 0

  return (
    <Card padding="sm" className={cn('flex flex-col gap-2', !isGroup && 'ml-4 border-l-2 border-gold/20')}>
      <div className="flex items-start justify-between gap-2">
        <button
          className={cn('flex items-center gap-2 flex-1 min-w-0 text-left', collapsible ? 'cursor-pointer' : 'cursor-default')}
          onClick={collapsible ? onToggle : undefined}
          aria-expanded={collapsible ? isExpanded : undefined}
          type="button"
        >
          {envelope.emoji && (
            <span className="text-lg shrink-0">{envelope.emoji}</span>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-ui font-semibold text-ink truncate">{envelope.name}</span>
            <div className="flex items-center gap-2 flex-wrap">
              {envelope.spendCategory && (
                <span className={cn('text-xs font-ui px-1.5 py-0.5 rounded', SPEND_COLORS[envelope.spendCategory])}>
                  {SPEND_LABELS[envelope.spendCategory]}
                </span>
              )}
              {isGroup && subCount > 0 && (
                <span className="text-xs font-ui text-ink-faint">{subCount} sub-sobre{subCount !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
          {collapsible && (
            <ChevronDown
              size={14}
              className={cn('shrink-0 text-ink-muted transition-transform ml-auto', isExpanded && 'rotate-180')}
            />
          )}
        </button>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(envelope)} aria-label="Editar">
            <Pencil size={13} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDeactivate(envelope.id)} aria-label="Desactivar">
            <PowerOff size={13} />
          </Button>
        </div>
      </div>

      {stats?.kind === 'monthly' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-ui text-ink-faint">Disponible</span>
            <span className={cn('text-xs font-mono font-semibold', stats.available < 0 ? 'text-coral' : 'text-sage')}>
              {fmt(stats.available, stats.symbol)} de {fmt(stats.budget, stats.symbol)}
            </span>
          </div>
          <ProgressBar value={stats.budget - stats.available} max={stats.budget} className="mx-0" />
        </div>
      )}

      {stats?.kind === 'savings' && (
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-ui text-ink-faint">
            <PiggyBank size={13} className="text-gold" />
            Acumulado
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-gold">
              {fmt(stats.accumulated, stats.symbol)}
            </span>
            {stats.monthAllocated > 0 && (
              <span className="text-xs font-mono text-sage">
                +{fmt(stats.monthAllocated, stats.symbol)} este mes
              </span>
            )}
          </span>
        </div>
      )}
    </Card>
  )
}
