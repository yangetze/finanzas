import type { CurrencyTotal } from './budgetTotals'
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

// Net owed per currency: positive means the debtor owes the user, negative
// means the user owes the debtor. they_owe_me adds, i_owe_them subtracts.
export function netByDebtor(debts: PersonalDebt[], payments: PersonalDebtPayment[]): CurrencyTotal[] {
  const totals: CurrencyTotal[] = []
  for (const debt of debts) {
    const outstanding = outstandingAmount(debt, payments)
    const signed = debt.direction === 'they_owe_me' ? outstanding : -outstanding
    const existing = totals.find((t) => t.currencyId === debt.currencyId)
    if (existing) existing.total += signed
    else totals.push({ currencyId: debt.currencyId, total: signed })
  }
  return totals.filter((t) => t.total !== 0)
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
