import { TriangleAlert, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { SavingsByWalletRow } from '@/lib/savingsByWallet'

interface SavingsByWalletSummaryProps {
  rows: SavingsByWalletRow[]
  currencies: { id: string; symbol: string }[]
}

const TOLERANCE = 0.01

function fmt(amount: number, symbol: string) {
  return `${symbol} ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function SavingsByWalletSummary({ rows, currencies }: SavingsByWalletSummaryProps) {
  if (rows.length === 0) return null

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <h2 className="text-sm font-ui font-semibold text-ink">Ahorro por billetera</h2>
      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const symbol = currencies.find((c) => c.id === row.currencyId)?.symbol ?? ''
          const mismatch = Math.abs(row.planned - row.actual) > TOLERANCE
          return (
            <div key={row.walletId} className="flex items-center justify-between gap-2 text-xs font-ui">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Wallet size={13} />
                {row.walletName}
              </span>
              <span className="flex items-center gap-2 font-mono">
                <span className="text-ink-faint">Plan {fmt(row.planned, symbol)}</span>
                <span className="text-ink">Real {fmt(row.actual, symbol)}</span>
                {mismatch && (
                  <span className={cn('flex items-center gap-1 font-ui text-coral')}>
                    <TriangleAlert size={12} />
                    revisar
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
