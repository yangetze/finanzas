import { Pencil, PowerOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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

interface EnvelopeCardProps {
  envelope: Envelope
  subCount: number
  onEdit: (envelope: Envelope) => void
  onDeactivate: (id: string) => void
}

export function EnvelopeCard({ envelope, subCount, onEdit, onDeactivate }: EnvelopeCardProps) {
  const isGroup = envelope.parentId === null

  return (
    <Card padding="sm" className={cn('flex flex-col gap-2', !isGroup && 'ml-4 border-l-2 border-gold/20')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
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
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(envelope)} aria-label="Editar">
            <Pencil size={13} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDeactivate(envelope.id)} aria-label="Desactivar">
            <PowerOff size={13} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
