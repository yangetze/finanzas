import { describe, it, expect } from 'vitest'
import { outstandingAmount, netByDebtor, computeOffset } from './personalDebtTotals'
import type { PersonalDebt, PersonalDebtPayment } from '@/types'

const debt = (overrides: Partial<PersonalDebt> = {}): PersonalDebt => ({
  id: 'debt-1',
  userId: 'user-1',
  debtorId: 'debtor-1',
  direction: 'i_owe_them',
  description: 'test',
  currencyId: 'usd',
  originalAmount: 5,
  date: '2026-08-01',
  status: 'open',
  notes: null,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
  ...overrides,
})

const payment = (overrides: Partial<PersonalDebtPayment> = {}): PersonalDebtPayment => ({
  id: 'payment-1',
  userId: 'user-1',
  personalDebtId: 'debt-1',
  walletId: null,
  amount: 0,
  currencyId: 'usd',
  date: '2026-08-01',
  paymentType: 'payment',
  offsetGroupId: null,
  notes: null,
  createdAt: '2026-08-01',
  ...overrides,
})

describe('outstandingAmount', () => {
  it('equals originalAmount with no payments', () => {
    expect(outstandingAmount(debt({ originalAmount: 5 }), [])).toBe(5)
  })

  it('subtracts payments against that debt', () => {
    const debtA = debt({ id: 'debt-a', originalAmount: 5 })
    const payments = [payment({ personalDebtId: 'debt-a', amount: 4 })]
    expect(outstandingAmount(debtA, payments)).toBe(1)
  })

  it('ignores payments against other debts', () => {
    const debtA = debt({ id: 'debt-a', originalAmount: 5 })
    const payments = [payment({ personalDebtId: 'debt-b', amount: 4 })]
    expect(outstandingAmount(debtA, payments)).toBe(5)
  })

  it('never goes below zero', () => {
    const debtA = debt({ id: 'debt-a', originalAmount: 5 })
    const payments = [payment({ personalDebtId: 'debt-a', amount: 8 })]
    expect(outstandingAmount(debtA, payments)).toBe(0)
  })
})

describe('netByDebtor', () => {
  it('returns empty array for no debts', () => {
    expect(netByDebtor([], [])).toEqual([])
  })

  it('nets they_owe_me minus i_owe_them per currency (guiding example)', () => {
    const debtA = debt({ id: 'debt-a', direction: 'i_owe_them', originalAmount: 5, currencyId: 'usd' })
    const debtB = debt({ id: 'debt-b', direction: 'they_owe_me', originalAmount: 4, currencyId: 'usd' })
    expect(netByDebtor([debtA, debtB], [])).toEqual([{ currencyId: 'usd', total: -1 }])
  })

  it('keeps totals separate per currency', () => {
    const debtA = debt({ id: 'debt-a', direction: 'they_owe_me', originalAmount: 10, currencyId: 'usd' })
    const debtB = debt({ id: 'debt-b', direction: 'i_owe_them', originalAmount: 3000, currencyId: 'ves' })
    expect(netByDebtor([debtA, debtB], [])).toEqual([
      { currencyId: 'usd', total: 10 },
      { currencyId: 'ves', total: -3000 },
    ])
  })

  it('reflects payments already made', () => {
    const debtA = debt({ id: 'debt-a', direction: 'they_owe_me', originalAmount: 10, currencyId: 'usd' })
    const payments = [payment({ personalDebtId: 'debt-a', amount: 6 })]
    expect(netByDebtor([debtA], payments)).toEqual([{ currencyId: 'usd', total: 4 }])
  })

  it('excludes currencies fully settled (outstanding zero on both sides)', () => {
    const debtA = debt({ id: 'debt-a', direction: 'they_owe_me', originalAmount: 4, currencyId: 'usd' })
    const payments = [payment({ personalDebtId: 'debt-a', amount: 4 })]
    expect(netByDebtor([debtA], payments)).toEqual([])
  })
})

describe('computeOffset', () => {
  it('offsets the guiding example (debt A $5 i_owe_them vs debt B $4 they_owe_me)', () => {
    const debtA = debt({ id: 'debt-a', direction: 'i_owe_them', originalAmount: 5 })
    const debtB = debt({ id: 'debt-b', direction: 'they_owe_me', originalAmount: 4 })
    const result = computeOffset(debtA, debtB, [], [])
    expect(result).toEqual({
      offsetAmount: 4,
      debtAOutstanding: 1,
      debtBOutstanding: 0,
      debtAStatus: 'partial',
      debtBStatus: 'paid',
    })
  })

  it('fully settles both debts when amounts are equal', () => {
    const debtA = debt({ id: 'debt-a', direction: 'i_owe_them', originalAmount: 4 })
    const debtB = debt({ id: 'debt-b', direction: 'they_owe_me', originalAmount: 4 })
    const result = computeOffset(debtA, debtB, [], [])
    expect(result).toEqual({
      offsetAmount: 4,
      debtAOutstanding: 0,
      debtBOutstanding: 0,
      debtAStatus: 'paid',
      debtBStatus: 'paid',
    })
  })

  it('accounts for prior partial payments before offsetting', () => {
    const debtA = debt({ id: 'debt-a', direction: 'i_owe_them', originalAmount: 5 })
    const debtB = debt({ id: 'debt-b', direction: 'they_owe_me', originalAmount: 4 })
    const paymentsA = [payment({ personalDebtId: 'debt-a', amount: 2 })]
    const result = computeOffset(debtA, debtB, paymentsA, [])
    // debtA outstanding before offset: 3, debtB outstanding: 4 -> offset = min(3, 4) = 3
    expect(result).toEqual({
      offsetAmount: 3,
      debtAOutstanding: 0,
      debtBOutstanding: 1,
      debtAStatus: 'paid',
      debtBStatus: 'partial',
    })
  })

  it('throws when debts do not have opposite directions', () => {
    const debtA = debt({ id: 'debt-a', direction: 'i_owe_them', originalAmount: 5 })
    const debtB = debt({ id: 'debt-b', direction: 'i_owe_them', originalAmount: 4 })
    expect(() => computeOffset(debtA, debtB, [], [])).toThrow()
  })

  it('throws when debts are in different currencies', () => {
    const debtA = debt({ id: 'debt-a', direction: 'i_owe_them', originalAmount: 5, currencyId: 'usd' })
    const debtB = debt({ id: 'debt-b', direction: 'they_owe_me', originalAmount: 4, currencyId: 've' })
    expect(() => computeOffset(debtA, debtB, [], [])).toThrow()
  })
})
