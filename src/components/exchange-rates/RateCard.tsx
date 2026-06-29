import { Pencil } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ExchangeRate, Currency } from '@/types'

interface RateCardProps {
  rate: ExchangeRate
  currencies: Currency[]
  onEdit: (rate: ExchangeRate) => void
}

export function RateCard({ rate, currencies, onEdit }: RateCardProps) {
  const from = currencies.find((c) => c.id === rate.fromCurrencyId)
  const to = currencies.find((c) => c.id === rate.toCurrencyId)

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-ui text-ink-faint uppercase tracking-wide">
            {rate.rateDate}
            {rate.source && ` · ${rate.source}`}
          </span>
          <span className="text-base font-ui font-semibold text-ink">
            {from?.code ?? rate.fromCurrencyId} → {to?.code ?? rate.toCurrencyId}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onEdit(rate)} aria-label="Editar">
          <Pencil size={14} />
        </Button>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-xs font-ui text-ink-muted">Tasa</span>
        <span className="text-lg font-mono font-semibold text-gold">
          {rate.rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </span>
      </div>
    </Card>
  )
}
