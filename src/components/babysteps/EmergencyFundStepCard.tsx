import { CheckCircle2, ShieldAlert, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { EmergencyFundResult } from '@/lib/emergencyFund'

interface EmergencyFundStepCardProps {
  result: EmergencyFundResult
  target: number
  currencies: { id: string; code: string }[]
}

function fmt(amount: number) {
  return `$ ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function EmergencyFundStepCard({ result, target, currencies }: EmergencyFundStepCardProps) {
  const isComplete = result.total !== null && result.total >= target

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-gold shrink-0" />
        <span className="text-sm font-ui font-semibold text-ink">Paso 1 · Fondo de emergencia</span>
      </div>

      {result.total !== null ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-mono font-semibold text-ink">
              {fmt(result.total)} de {fmt(target)}
            </span>
            {isComplete && (
              <span className="flex items-center gap-1 text-xs font-ui text-sage">
                <CheckCircle2 size={13} />
                Completado
              </span>
            )}
          </div>
          <ProgressBar value={result.total} max={target} className="mx-0" />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm font-ui text-coral">
          <TriangleAlert size={16} className="shrink-0" />
          <span>
            Falta cargar la tasa de cambio para consolidar:{' '}
            {result.missingCurrencyIds
              .map((id) => currencies.find((c) => c.id === id)?.code ?? id)
              .join(', ')}
          </span>
        </div>
      )}
    </Card>
  )
}
