import { sumByCurrency, type CurrencyTotal } from './budgetTotals'
import { convertToDollarGroup, type RateRow } from './emergencyFund'
import type { BudgetFrequency } from '@/types'

// Average monthly cost of each frequency, independent of which calendar
// month it's evaluated in (unlike stampMonth's occurrence-based math, which
// depends on where paymentDay falls in a specific month).
const MONTHLY_FACTOR: Record<BudgetFrequency, number> = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  annual: 1 / 12,
}

export function monthlyEquivalent(item: { frequency: BudgetFrequency; baseAmount: number }): number {
  return item.baseAmount * MONTHLY_FACTOR[item.frequency]
}

export interface ExpenseBudgetItem {
  envelopeId: string
  isActive: boolean
  frequency: BudgetFrequency
  baseAmount: number
  currencyId: string
}

export interface ExpenseEnvelope {
  id: string
  isSavings: boolean
}

// Baby Step 3 (3-6 months of expenses): "expenses" excludes anything feeding
// a savings envelope — those are savings contributions, not living costs,
// and counting them would double the target with money already set aside.
export function totalMonthlyExpensesByCurrency(
  items: ExpenseBudgetItem[],
  envelopes: ExpenseEnvelope[],
): CurrencyTotal[] {
  const savingsEnvelopeIds = new Set(envelopes.filter((e) => e.isSavings).map((e) => e.id))
  const expenseItems = items.filter((i) => i.isActive && !savingsEnvelopeIds.has(i.envelopeId))
  return sumByCurrency(
    expenseItems.map((i) => ({ currencyId: i.currencyId, baseAmount: monthlyEquivalent(i) })),
  )
}

export interface MonthlyExpensesResult {
  total: number | null
  missingCurrencyIds: string[]
}

export function consolidateMonthlyExpenses(
  totals: CurrencyTotal[],
  dollarGroupIds: Set<string>,
  rates: RateRow[],
): MonthlyExpensesResult {
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
