import { Pencil, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, Currency, Envelope } from '@/types'

interface TransactionRowProps {
  transaction: Transaction
  currency: Currency
  envelope?: Envelope
  onEdit: (tx: Transaction) => void
  onMarkPaid: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_LABELS: Record<Transaction['status'], string> = {
  apartado: 'Apartado',
  pagado: 'Pagado',
  anulado: 'Anulado',
}

export function TransactionRow({ transaction: tx, currency, envelope, onEdit, onMarkPaid, onDelete }: TransactionRowProps) {
  const amount = tx.paymentAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-ui text-ink truncate">{tx.description}</span>
          <span
            className={cn(
              'text-xs font-ui px-1.5 py-0.5 rounded',
              tx.status === 'apartado' && 'bg-amber-fin/20 text-amber-fin',
              tx.status === 'pagado' && 'bg-sage/20 text-sage',
              tx.status === 'anulado' && 'bg-ink-faint/20 text-ink-faint',
            )}
          >
            {STATUS_LABELS[tx.status]}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-ui text-ink-faint">{tx.date}</span>
          {envelope && (
            <>
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs font-ui text-ink-muted">
                {envelope.emoji ? `${envelope.emoji} ` : ''}{envelope.name}
              </span>
            </>
          )}
        </div>
      </div>

      <span
        className={cn(
          'text-sm font-mono font-semibold shrink-0',
          tx.type === 'expense' ? 'text-coral' : 'text-sage',
        )}
      >
        {tx.type === 'expense' ? '−' : '+'}{currency.symbol} {amount}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {tx.status === 'apartado' && (
          <button
            type="button"
            aria-label="Pagar"
            onClick={() => onMarkPaid(tx.id)}
            className="p-1.5 rounded text-ink-faint hover:text-sage transition-colors"
          >
            <CheckCircle size={15} />
          </button>
        )}
        <button
          type="button"
          aria-label="Editar"
          onClick={() => onEdit(tx)}
          className="p-1.5 rounded text-ink-faint hover:text-gold transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          aria-label="Anular"
          onClick={() => onDelete(tx.id)}
          className="p-1.5 rounded text-ink-faint hover:text-coral transition-colors"
        >
          <XCircle size={15} />
        </button>
      </div>
    </div>
  )
}
