import { sumByCurrency, type CurrencyTotal } from './budgetTotals'
import { convertToDollarGroup, type RateRow } from './emergencyFund'
import { monthlyEquivalent } from './monthlyExpenses'
import type { BudgetFrequency } from '@/types'

export interface InvestmentBudgetItem {
  envelopeId: string
  isActive: boolean
  frequency: BudgetFrequency
  baseAmount: number
  currencyId: string
}

// Baby Step 4 (invest 15% of income): monthly-equivalent total of active
// items feeding envelopes flagged counts_as_investment (e.g. RetoBitcoin365),
// the mirror of monthlyExpenses' savings exclusion.
export function totalMonthlyInvestmentByCurrency(
  items: InvestmentBudgetItem[],
  investmentEnvelopeIds: Set<string>,
): CurrencyTotal[] {
  const investedItems = items.filter((i) => i.isActive && investmentEnvelopeIds.has(i.envelopeId))
  return sumByCurrency(investedItems.map((i) => ({ currencyId: i.currencyId, baseAmount: monthlyEquivalent(i) })))
}

export interface IncomeEntry {
  yearMonth: string
  currencyId: string
  amount: number
}

// Average monthly income per currency, divided by the number of distinct
// calendar months observed across ALL income (not just that currency) so a
// month with only VES income doesn't shrink the USD average, and vice versa.
export function averageMonthlyIncomeByCurrency(entries: IncomeEntry[]): CurrencyTotal[] {
  const months = new Set(entries.map((e) => e.yearMonth))
  if (months.size === 0) return []
  const totals = sumByCurrency(entries.map((e) => ({ currencyId: e.currencyId, baseAmount: e.amount })))
  return totals.map((t) => ({ currencyId: t.currencyId, total: t.total / months.size }))
}

export interface DollarConsolidation {
  total: number | null
  missingCurrencyIds: string[]
}

export function consolidateToDollarGroup(
  totals: CurrencyTotal[],
  dollarGroupIds: Set<string>,
  rates: RateRow[],
): DollarConsolidation {
  let total = 0
  const missing = new Set<string>()

  for (const t of totals) {
    const converted = convertToDollarGroup(t.total, t.currencyId, dollarGroupIds, rates)
    if (converted === null) {
      missing.add(t.currencyId)
      continue
    }
    total += converted
  }

  return { total: missing.size > 0 ? null : total, missingCurrencyIds: [...missing] }
}
