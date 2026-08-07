import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrencyWithCode, formatShortDate } from '@/lib/utils'
import type { PersonalDebt, PersonalDebtPayment, Currency, Wallet } from '@/types'

const STATUS_LABEL: Record<PersonalDebt['status'], string> = {
  open: 'Abierta',
  partial: 'Parcial',
  paid: 'Pagada',
}

const STATUS_COLOR: Record<PersonalDebt['status'], string> = {
  open: 'text-ink-muted bg-canvas-muted',
  partial: 'text-amber-fin bg-amber-fin/15',
  paid: 'text-sage bg-sage/15',
}

interface PersonalDebtRowProps {
  debt: PersonalDebt
  currency: Currency
  outstanding: number
  payments: PersonalDebtPayment[]
  wallets: Wallet[]
  onAddPayment: (debt: PersonalDebt) => void
  onDelete: (debt: PersonalDebt) => void
  onDeletePayment: (payment: PersonalDebtPayment) => void
}

export function PersonalDebtRow({
  debt,
  currency,
  outstanding,
  payments,
  wallets,
  onAddPayment,
  onDelete,
  onDeletePayment,
}: PersonalDebtRowProps) {
  const [expanded, setExpanded] = useState(false)
  const directionLabel = debt.direction === 'they_owe_me' ? 'Me deben' : 'Le debo'
  const directionColor = debt.direction === 'they_owe_me' ? 'text-sage' : 'text-coral'

  function walletName(walletId: string | null) {
    if (!walletId) return null
    return wallets.find((w) => w.id === walletId)?.name ?? '—'
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-ink-faint shrink-0"
          aria-label={expanded ? 'Contraer' : 'Expandir'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-ui text-ink">{debt.description}</span>
            <span className={`text-xs font-ui ${directionColor}`}>{directionLabel}</span>
            <span className={`text-xs font-ui px-1.5 py-0.5 rounded ${STATUS_COLOR[debt.status]}`}>
              {STATUS_LABEL[debt.status]}
            </span>
            {debt.isIndexed && (
              <span className="text-xs font-ui px-1.5 py-0.5 rounded text-amber-fin bg-amber-fin/15">
                Indexada
              </span>
            )}
          </div>
          <span className="text-xs font-ui text-ink-faint">{formatShortDate(debt.date)}</span>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-sm font-mono text-ink">{formatCurrencyWithCode(outstanding, currency)}</span>
          {outstanding !== debt.originalAmount && (
            <span className="block text-xs font-mono text-ink-faint">
              de {formatCurrencyWithCode(debt.originalAmount, currency)}
            </span>
          )}
        </div>

        <div className="flex gap-1.5 shrink-0">
          {debt.status !== 'paid' && (
            <Button variant="ghost" size="sm" onClick={() => onAddPayment(debt)} aria-label="Agregar pago">
              <Plus size={14} />
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => onDelete(debt)} aria-label="Eliminar deuda">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pl-11 flex flex-col gap-1.5">
          {payments.length === 0 ? (
            <p className="text-xs font-ui text-ink-faint">Sin pagos registrados</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-2 text-xs font-ui">
                <span className="text-ink-muted">
                  {formatShortDate(payment.date)} ·{' '}
                  {payment.paymentType === 'offset' ? 'Compensación' : walletName(payment.walletId)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-ink">{formatCurrencyWithCode(payment.amount, currency)}</span>
                  <button
                    type="button"
                    aria-label="Eliminar pago"
                    onClick={() => onDeletePayment(payment)}
                    className="text-ink-faint hover:text-coral transition-colors"
                  >
                    <XCircle size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
