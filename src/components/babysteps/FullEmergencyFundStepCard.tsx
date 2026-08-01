import { CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { EmergencyFundResult } from '@/lib/emergencyFund'
import type { MonthlyExpensesResult } from '@/lib/monthlyExpenses'

interface FullEmergencyFundStepCardProps {
  fund: EmergencyFundResult
  expenses: MonthlyExpensesResult
  currencies: { id: string; code: string }[]
}

function fmt(amount: number) {
  return `$ ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function FullEmergencyFundStepCard({ fund, expenses, currencies }: FullEmergencyFundStepCardProps) {
  const missing = [...new Set([...fund.missingCurrencyIds, ...expenses.missingCurrencyIds])]

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-gold shrink-0" />
        <span className="text-sm font-ui font-semibold text-ink">
          Paso 3 · Fondo de emergencia completo (3 a 6 meses)
        </span>
      </div>

      {fund.total !== null && expenses.total !== null ? (
        <FullEmergencyFundProgress accumulated={fund.total} monthlyExpenses={expenses.total} />
      ) : (
        <div className="flex items-center gap-2 text-sm font-ui text-coral">
          <TriangleAlert size={16} className="shrink-0" />
          <span>
            Falta cargar la tasa de cambio para consolidar: {missing.map((id) => currencies.find((c) => c.id === id)?.code ?? id).join(', ')}
          </span>
        </div>
      )}
    </Card>
  )
}

function FullEmergencyFundProgress({
  accumulated,
  monthlyExpenses,
}: {
  accumulated: number
  monthlyExpenses: number
}) {
  const minTarget = monthlyExpenses * 3
  const idealTarget = monthlyExpenses * 6
  const reachedMin = accumulated >= minTarget
  const reachedIdeal = accumulated >= idealTarget

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-mono font-semibold text-ink">{fmt(accumulated)} acumulado</span>
        {reachedIdeal ? (
          <span className="flex items-center gap-1 text-xs font-ui text-sage">
            <CheckCircle2 size={13} />
            Completado
          </span>
        ) : reachedMin ? (
          <span className="flex items-center gap-1 text-xs font-ui text-gold">
            <CheckCircle2 size={13} />
            Mínimo alcanzado
          </span>
        ) : null}
      </div>
      <ProgressBar value={accumulated} max={idealTarget} className="mx-0" />
      <div className="flex items-center justify-between text-xs font-ui text-ink-faint">
        <span>3 meses: {fmt(minTarget)}</span>
        <span>6 meses: {fmt(idealTarget)}</span>
      </div>
    </div>
  )
}
