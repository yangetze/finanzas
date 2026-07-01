import { describe, it, expect } from 'vitest'
import { buildStampedTransactions, shouldStampThisMonth } from './stampMonth'
import type { BudgetItemStampInput } from './stampMonth'

const BASE_CURRENCY_ID = 'base-usd'
const USDC_ID = 'cur-usdc'
const VES_ID = 'cur-ves'

const monthly: BudgetItemStampInput = {
  id: 'item-1',
  envelopeId: 'env-1',
  walletId: 'wallet-1',
  name: 'Netflix',
  baseAmount: 15,
  currencyId: USDC_ID,
  paymentCurrencyId: null,
  referenceRate: null,
  paymentDay: 5,
  frequency: 'monthly',
  startMonth: null,
}

const multiCurrency: BudgetItemStampInput = {
  id: 'item-2',
  envelopeId: 'env-2',
  walletId: null,
  name: 'Electricidad',
  baseAmount: 14,
  currencyId: USDC_ID,
  paymentCurrencyId: VES_ID,
  referenceRate: 36,
  paymentDay: 10,
  frequency: 'monthly',
  startMonth: null,
}

describe('shouldStampThisMonth', () => {
  it('always stamps monthly items', () => {
    expect(shouldStampThisMonth('monthly', null, 3)).toBe(true)
    expect(shouldStampThisMonth('monthly', null, 11)).toBe(true)
  })

  it('stamps quarterly items every 3 months from startMonth', () => {
    expect(shouldStampThisMonth('quarterly', 1, 1)).toBe(true)
    expect(shouldStampThisMonth('quarterly', 1, 4)).toBe(true)
    expect(shouldStampThisMonth('quarterly', 1, 7)).toBe(true)
    expect(shouldStampThisMonth('quarterly', 1, 10)).toBe(true)
    expect(shouldStampThisMonth('quarterly', 1, 2)).toBe(false)
    expect(shouldStampThisMonth('quarterly', 1, 5)).toBe(false)
  })

  it('defaults quarterly startMonth to 1 when null', () => {
    expect(shouldStampThisMonth('quarterly', null, 1)).toBe(true)
    expect(shouldStampThisMonth('quarterly', null, 4)).toBe(true)
    expect(shouldStampThisMonth('quarterly', null, 2)).toBe(false)
  })

  it('stamps semiannual items every 6 months', () => {
    expect(shouldStampThisMonth('semiannual', 3, 3)).toBe(true)
    expect(shouldStampThisMonth('semiannual', 3, 9)).toBe(true)
    expect(shouldStampThisMonth('semiannual', 3, 4)).toBe(false)
  })

  it('stamps annual items only on the start month', () => {
    expect(shouldStampThisMonth('annual', 6, 6)).toBe(true)
    expect(shouldStampThisMonth('annual', 6, 7)).toBe(false)
  })
})

describe('buildStampedTransactions', () => {
  it('creates a pendiente transaction for each unstamped item', () => {
    const result = buildStampedTransactions([monthly], new Set(), '2026-07', BASE_CURRENCY_ID)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('pendiente')
    expect(result[0].budgetItemId).toBe('item-1')
  })

  it('skips items already stamped this month', () => {
    const result = buildStampedTransactions([monthly], new Set(['item-1']), '2026-07', BASE_CURRENCY_ID)
    expect(result).toHaveLength(0)
  })

  it('sets date from paymentDay', () => {
    const result = buildStampedTransactions([monthly], new Set(), '2026-07', BASE_CURRENCY_ID)
    expect(result[0].date).toBe('2026-07-05')
  })

  it('defaults date to 1st when paymentDay is null', () => {
    const item: BudgetItemStampInput = { ...monthly, paymentDay: null }
    const result = buildStampedTransactions([item], new Set(), '2026-07', BASE_CURRENCY_ID)
    expect(result[0].date).toBe('2026-07-01')
  })

  it('builds same-currency transaction correctly', () => {
    const result = buildStampedTransactions([monthly], new Set(), '2026-07', BASE_CURRENCY_ID)
    const tx = result[0]
    expect(tx.originCurrencyId).toBe(USDC_ID)
    expect(tx.originAmount).toBe(15)
    expect(tx.paymentCurrencyId).toBe(USDC_ID)
    expect(tx.paymentAmount).toBe(15)
    expect(tx.conversionRate).toBeNull()
  })

  it('builds multi-currency transaction: VES invoice paid in USDC', () => {
    const result = buildStampedTransactions([multiCurrency], new Set(), '2026-07', BASE_CURRENCY_ID)
    const tx = result[0]
    expect(tx.originCurrencyId).toBe(VES_ID)
    expect(tx.originAmount).toBeCloseTo(504) // 14 * 36
    expect(tx.paymentCurrencyId).toBe(USDC_ID)
    expect(tx.paymentAmount).toBe(14)
    expect(tx.conversionRate).toBe(36)
  })

  it('skips non-monthly items that should not stamp this month', () => {
    const quarterly: BudgetItemStampInput = { ...monthly, id: 'q1', frequency: 'quarterly', startMonth: 1 }
    // month 2 should NOT stamp a quarterly item starting month 1
    const result = buildStampedTransactions([quarterly], new Set(), '2026-02', BASE_CURRENCY_ID)
    expect(result).toHaveLength(0)
  })

  it('stamps quarterly item on the correct month', () => {
    const quarterly: BudgetItemStampInput = { ...monthly, id: 'q1', frequency: 'quarterly', startMonth: 1 }
    const result = buildStampedTransactions([quarterly], new Set(), '2026-04', BASE_CURRENCY_ID)
    expect(result).toHaveLength(1)
  })
})
