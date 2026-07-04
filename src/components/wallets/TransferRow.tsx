import { ArrowRight, XCircle } from 'lucide-react'
import type { Transfer, Currency, Wallet } from '@/types'

interface TransferRowProps {
  transfer: Transfer
  fromWallet?: Wallet
  toWallet?: Wallet
  fromCurrency?: Currency
  toCurrency?: Currency
  onDelete: (transfer: Transfer) => void
}

function fmt(amount: number, symbol: string) {
  return `${symbol} ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TransferRow({ transfer, fromWallet, toWallet, fromCurrency, toCurrency, onDelete }: TransferRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-ui text-ink">{fromWallet?.name ?? '—'}</span>
          <ArrowRight size={13} className="text-ink-faint shrink-0" />
          <span className="text-sm font-ui text-ink">{toWallet?.name ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs font-ui text-ink-faint">{transfer.date}</span>
          {transfer.commission > 0 && fromCurrency && (
            <>
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs font-ui text-amber-fin">
                comisión {fmt(transfer.commission, fromCurrency.symbol)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="block text-sm font-mono text-coral">
          −{fmt(transfer.amountSent, fromCurrency?.symbol ?? '')}
        </span>
        <span className="block text-sm font-mono text-sage">
          +{fmt(transfer.amountReceived, toCurrency?.symbol ?? '')}
        </span>
      </div>

      <button
        type="button"
        aria-label="Eliminar"
        onClick={() => onDelete(transfer)}
        className="p-1.5 rounded text-ink-faint hover:text-coral transition-colors shrink-0"
      >
        <XCircle size={15} />
      </button>
    </div>
  )
}
