import { CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Wallet, Currency } from '@/types'

function fmt(amount: number, symbol: string) {
  return `${symbol} ${Math.abs(amount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtAvailable(amount: number, symbol: string) {
  if (amount < 0) {
    return `- ${symbol} ${Math.abs(amount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return fmt(amount, symbol)
}

interface TDCCardProps {
  wallet: Wallet
  currency: Currency
}

export function TDCCard({ wallet, currency }: TDCCardProps) {
  const used = wallet.balance
  const limit = wallet.creditLimit
  const available = limit !== null ? limit - used : null

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-ink-muted shrink-0" />
          <span className="text-sm font-ui font-medium text-ink">{wallet.name}</span>
        </div>
        <span className="text-xs font-ui text-ink-faint">{currency.code}</span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-ui text-ink-faint mb-0.5">Usado</p>
          <p className="text-lg font-mono font-semibold text-coral">{fmt(used, currency.symbol)}</p>
        </div>
        {limit !== null ? (
          <div className="text-right">
            <p className="text-xs font-ui text-ink-faint mb-0.5">Límite</p>
            <p className="text-sm font-mono text-ink-muted">{fmt(limit, currency.symbol)}</p>
          </div>
        ) : (
          <span className="text-xs font-ui text-ink-faint">Sin límite</span>
        )}
      </div>

      {limit !== null && (
        <>
          <ProgressBar value={used} max={limit} />
          <div className="flex justify-between text-xs font-ui text-ink-faint">
            <span>Disponible</span>
            <span className={`font-mono ${available! < 0 ? 'text-coral' : 'text-sage'}`}>
              {fmtAvailable(available!, currency.symbol)}
            </span>
          </div>
        </>
      )}
    </Card>
  )
}
