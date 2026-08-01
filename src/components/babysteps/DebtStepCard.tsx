import { PartyPopper, Target } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { CurrencyTotal } from '@/lib/budgetTotals'

interface DebtStepCardProps {
  totals: CurrencyTotal[]
  currencies: { id: string; symbol: string }[]
}

function fmt(amount: number, symbol: string) {
  return `${symbol} ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function DebtStepCard({ totals, currencies }: DebtStepCardProps) {
  const isDebtFree = totals.length === 0

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-gold shrink-0" />
        <span className="text-sm font-ui font-semibold text-ink">Paso 2 · Pagar toda la deuda</span>
      </div>

      {isDebtFree ? (
        <div className="flex items-center gap-2 text-sm font-ui text-sage">
          <PartyPopper size={16} />
          Sin deudas activas (TDC y Cashea en $0)
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {totals.map((t) => {
            const symbol = currencies.find((c) => c.id === t.currencyId)?.symbol ?? ''
            return (
              <div key={t.currencyId} className="flex items-center justify-between text-sm font-ui">
                <span className="text-ink-faint">Deuda total (TDC + Cashea)</span>
                <span className="font-mono font-semibold text-coral">{fmt(t.total, symbol)}</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
