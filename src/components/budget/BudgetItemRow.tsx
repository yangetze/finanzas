import { Pencil, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { BudgetItem, Currency } from '@/types'

const FREQUENCY_LABELS: Record<BudgetItem['frequency'], string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
}

interface BudgetItemRowProps {
  item: BudgetItem
  currency: Currency
  spent?: number
  pending?: number
  onEdit: (item: BudgetItem) => void
  onDeactivate: (id: string) => void
}

export function BudgetItemRow({ item, currency, spent, pending, onEdit, onDeactivate }: BudgetItemRowProps) {
  const hasSpending = spent !== undefined
  const hasPending = pending !== undefined && pending > 0

  const fmt = (n: number) =>
    `${currency.symbol} ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="flex flex-col gap-1.5 py-2 px-3 hover:bg-canvas-muted transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-ui font-medium text-ink truncate">{item.name}</span>
          <span className="text-xs font-ui text-ink-faint">
            {FREQUENCY_LABELS[item.frequency]}
            {item.paymentDay ? ` · día ${item.paymentDay}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            {hasSpending && (
              <span className="block text-xs font-mono text-ink-muted">
                gastado {fmt(spent ?? 0)}
              </span>
            )}
            {hasPending && (
              <span className="block text-xs font-mono text-amber-fin">
                pendiente {fmt(pending)}
              </span>
            )}
            <span className="text-sm font-mono font-semibold text-gold">
              {fmt(item.baseAmount)}
            </span>
            <span className="block text-xs font-ui text-ink-faint">{currency.code}</span>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)} aria-label="Editar">
              <Pencil size={13} />
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDeactivate(item.id)} aria-label="Desactivar">
              <PowerOff size={13} />
            </Button>
          </div>
        </div>
      </div>

      {hasSpending && (
        <ProgressBar value={spent ?? 0} max={item.baseAmount} className="mx-0" />
      )}
    </div>
  )
}
