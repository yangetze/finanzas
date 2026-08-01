import { CheckCircle2, PiggyBank, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { DollarConsolidation } from '@/lib/investing'

interface InvestmentStepCardProps {
  income: DollarConsolidation
  investment: DollarConsolidation
  hasIncomeHistory: boolean
  currencies: { id: string; code: string }[]
}

const TARGET_PERCENT = 15

function fmt(amount: number) {
  return `$ ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function InvestmentStepCard({ income, investment, hasIncomeHistory, currencies }: InvestmentStepCardProps) {
  const missing = [...new Set([...income.missingCurrencyIds, ...investment.missingCurrencyIds])]

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <PiggyBank size={16} className="text-gold shrink-0" />
        <span className="text-sm font-ui font-semibold text-ink">Paso 4 · Invertir el 15% de tus ingresos</span>
      </div>

      {!hasIncomeHistory ? (
        <p className="text-sm font-ui text-ink-faint">Sin ingresos registrados todavía para calcular este paso.</p>
      ) : income.total !== null && investment.total !== null ? (
        <InvestmentProgress monthlyIncome={income.total} monthlyInvestment={investment.total} />
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

function InvestmentProgress({ monthlyIncome, monthlyInvestment }: { monthlyIncome: number; monthlyInvestment: number }) {
  const percent = monthlyIncome > 0 ? (monthlyInvestment / monthlyIncome) * 100 : 0
  const reached = percent >= TARGET_PERCENT

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-mono font-semibold text-ink">
          {percent.toLocaleString('es-VE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% de {TARGET_PERCENT}%
        </span>
        {reached && (
          <span className="flex items-center gap-1 text-xs font-ui text-sage">
            <CheckCircle2 size={13} />
            Completado
          </span>
        )}
      </div>
      <ProgressBar value={percent} max={TARGET_PERCENT} className="mx-0" />
      <div className="flex items-center justify-between text-xs font-ui text-ink-faint">
        <span>Invertido/mes: {fmt(monthlyInvestment)}</span>
        <span>Ingreso/mes: {fmt(monthlyIncome)}</span>
      </div>
    </div>
  )
}
