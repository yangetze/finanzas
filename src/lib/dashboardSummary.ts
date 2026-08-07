import { sumByCurrency, type CurrencyTotal } from './budgetTotals'

export interface NetWorthRow {
  currencyId: string
  assets: number
  debts: number
  net: number
}

// Merges asset and debt totals (already grouped per currency by sumByCurrency /
// totalDebtByCurrency) into a single "lo que tengo vs lo que debo" row, never
// mixing currencies into one number.
export function netWorthByCurrency(assetTotals: CurrencyTotal[], debtTotals: CurrencyTotal[]): NetWorthRow[] {
  const currencyIds = new Set([...assetTotals.map((t) => t.currencyId), ...debtTotals.map((t) => t.currencyId)])
  return [...currencyIds].map((currencyId) => {
    const assets = assetTotals.find((t) => t.currencyId === currencyId)?.total ?? 0
    const debts = debtTotals.find((t) => t.currencyId === currencyId)?.total ?? 0
    return { currencyId, assets, debts, net: assets - debts }
  })
}

export interface MonthlyExpensePoint {
  yearMonth: string
  totalsByCurrency: CurrencyTotal[]
}

interface ExpenseTransaction {
  date: string
  status: string
  type: string
  paymentCurrencyId: string
  paymentAmount: number
}

// Last `monthsBack` months (inclusive of the reference month), oldest first,
// with paid-expense totals per currency for each — powers the dashboard's
// "evolución" chart without pulling in unpaid/pending or income rows.
export function monthlyExpenseSeries(
  transactions: ExpenseTransaction[],
  monthsBack: number,
  referenceDate: Date,
): MonthlyExpensePoint[] {
  const months: string[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const paidExpenses = transactions.filter((t) => t.status === 'pagado' && t.type === 'expense')

  return months.map((yearMonth) => {
    const inMonth = paidExpenses.filter((t) => t.date.slice(0, 7) === yearMonth)
    return {
      yearMonth,
      totalsByCurrency: sumByCurrency(
        inMonth.map((t) => ({ currencyId: t.paymentCurrencyId, baseAmount: t.paymentAmount })),
      ),
    }
  })
}
