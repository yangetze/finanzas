import { Pencil, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, Currency, Wallet } from '@/types'

interface IncomeRowProps {
  income: Transaction
  currency: Currency
  wallet?: Wallet
  onEdit: (tx: Transaction) => void
  onMarkReceived: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_LABELS: Partial<Record<Transaction['status'], string>> = {
  pendiente: 'Pendiente',
  pagado: 'Recibido',
}

export function IncomeRow({ income: tx, currency, wallet, onEdit, onMarkReceived, onDelete }: IncomeRowProps) {
  const amount = tx.paymentAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-ui text-ink truncate">{tx.description}</span>
          <span
            className={cn(
              'text-xs font-ui px-1.5 py-0.5 rounded',
              tx.status === 'pendiente' && 'bg-amber-fin/20 text-amber-fin',
              tx.status === 'pagado' && 'bg-sage/20 text-sage',
            )}
          >
            {STATUS_LABELS[tx.status] ?? tx.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-ui text-ink-faint">{tx.date}</span>
          {wallet && (
            <>
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs font-ui text-ink-muted">{wallet.name}</span>
            </>
          )}
        </div>
      </div>

      <span className="text-sm font-mono font-semibold shrink-0 text-sage">
        +{currency.symbol} {amount}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {tx.status === 'pendiente' && (
          <button
            type="button"
            aria-label="Recibir"
            onClick={() => onMarkReceived(tx.id)}
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
          aria-label="Eliminar"
          onClick={() => onDelete(tx.id)}
          className="p-1.5 rounded text-ink-faint hover:text-coral transition-colors"
        >
          <XCircle size={15} />
        </button>
      </div>
    </div>
  )
}
