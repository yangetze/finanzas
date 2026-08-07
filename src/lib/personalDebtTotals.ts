import type { CurrencyTotal } from './budgetTotals'
import { isDollarEquivalent, convertToDollarGroup, type RateRow } from './emergencyFund'
import type { PersonalDebt, PersonalDebtPayment, PersonalDebtStatus } from '@/types'

export function outstandingAmount(debt: PersonalDebt, payments: PersonalDebtPayment[]): number {
  const paid = payments
    .filter((p) => p.personalDebtId === debt.id)
    .reduce((sum, p) => sum + p.amount, 0)
  return Math.max(0, debt.originalAmount - paid)
}

export function statusForOutstanding(originalAmount: number, outstanding: number): PersonalDebtStatus {
  if (outstanding <= 0) return 'paid'
  if (outstanding >= originalAmount) return 'open'
  return 'partial'
}

// A debt's own currency plus, when isIndexed, the index_currency_id it's
// pegged to (e.g. a debt recorded in VES indexed to USD). isIndexed/
// indexCurrencyId are optional so plain CurrencyTotal literals (as used by
// callers that don't care about indexing) remain valid.
export interface PersonalDebtCurrencyTotal extends CurrencyTotal {
  isIndexed?: boolean
  indexCurrencyId?: string | null
}

// Net owed per currency: positive means the debtor owes the user, negative
// means the user owes the debtor. they_owe_me adds, i_owe_them subtracts.
// Indexed and non-indexed debts of the same currency are kept in separate
// totals — an indexed amount is a peg reference, not the same thing as a
// real balance in that currency, and must not be silently merged with one.
export function netByDebtor(debts: PersonalDebt[], payments: PersonalDebtPayment[]): PersonalDebtCurrencyTotal[] {
  const totals: PersonalDebtCurrencyTotal[] = []
  for (const debt of debts) {
    const outstanding = outstandingAmount(debt, payments)
    const signed = debt.direction === 'they_owe_me' ? outstanding : -outstanding
    const existing = totals.find(
      (t) => t.currencyId === debt.currencyId && !!t.isIndexed === debt.isIndexed && t.indexCurrencyId === debt.indexCurrencyId,
    )
    if (existing) existing.total += signed
    else
      totals.push({
        currencyId: debt.currencyId,
        total: signed,
        isIndexed: debt.isIndexed,
        indexCurrencyId: debt.indexCurrencyId,
      })
  }
  return totals.filter((t) => t.total !== 0)
}

export interface IndexedCurrencyTotal extends CurrencyTotal {
  indexCurrencyId: string
}

export interface NetTotalsInUsdcResult {
  usdcTotal: number | null
  unconverted: CurrencyTotal[]
  indexed: IndexedCurrencyTotal[]
}

// Combines every non-indexed net total that can reach the USDC/USD "dollar
// group" (see isDollarEquivalent) into a single usdcTotal, converting fiat
// currencies via the latest stored admin rate. Currencies with no rate to
// bridge in are left in `unconverted`, shown in their own currency as
// before. Indexed totals never enter usdcTotal/unconverted — even when their
// own currency (or index currency) is USD/a stablecoin, an indexed amount is
// not the same thing as a real USD/USDC balance, so it's always broken out
// separately in `indexed`.
export function netTotalsInUsdc(
  netTotals: PersonalDebtCurrencyTotal[],
  currencies: { id: string; type: string; code: string }[],
  rates: RateRow[],
): NetTotalsInUsdcResult {
  const dollarGroupIds = new Set(currencies.filter(isDollarEquivalent).map((c) => c.id))

  let usdcTotal: number | null = null
  const unconverted: CurrencyTotal[] = []
  const indexed: IndexedCurrencyTotal[] = []

  for (const { currencyId, total, isIndexed, indexCurrencyId } of netTotals) {
    if (isIndexed && indexCurrencyId) {
      indexed.push({ currencyId, total, indexCurrencyId })
      continue
    }
    const converted = convertToDollarGroup(total, currencyId, dollarGroupIds, rates)
    if (converted === null) {
      unconverted.push({ currencyId, total })
    } else {
      usdcTotal = (usdcTotal ?? 0) + converted
    }
  }

  return { usdcTotal, unconverted, indexed }
}

export interface OffsetResult {
  offsetAmount: number
  debtAOutstanding: number
  debtBOutstanding: number
  debtAStatus: PersonalDebtStatus
  debtBStatus: PersonalDebtStatus
}

// Compensates two crossed debts of the same debtor/currency by the smaller
// of their outstanding balances (see docs/plan-sprint-08.md guiding example).
export function computeOffset(
  debtA: PersonalDebt,
  debtB: PersonalDebt,
  paymentsA: PersonalDebtPayment[],
  paymentsB: PersonalDebtPayment[],
): OffsetResult {
  if (debtA.direction === debtB.direction) {
    throw new Error('Cannot offset two debts with the same direction')
  }
  if (debtA.currencyId !== debtB.currencyId) {
    throw new Error('Cannot offset debts in different currencies')
  }

  const outstandingA = outstandingAmount(debtA, paymentsA)
  const outstandingB = outstandingAmount(debtB, paymentsB)
  const offsetAmount = Math.min(outstandingA, outstandingB)
  const debtAOutstanding = outstandingA - offsetAmount
  const debtBOutstanding = outstandingB - offsetAmount

  return {
    offsetAmount,
    debtAOutstanding,
    debtBOutstanding,
    debtAStatus: statusForOutstanding(debtA.originalAmount, debtAOutstanding),
    debtBStatus: statusForOutstanding(debtB.originalAmount, debtBOutstanding),
  }
}
