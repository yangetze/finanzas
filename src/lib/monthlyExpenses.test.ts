import { describe, it, expect } from 'vitest'
import { monthlyEquivalent, totalMonthlyExpensesByCurrency, consolidateMonthlyExpenses } from './monthlyExpenses'

const USDC_ID = 'cur-usdc'
const VES_ID = 'cur-ves'
const DOLLAR_GROUP = new Set([USDC_ID])

describe('monthlyEquivalent', () => {
  it('returns the amount unchanged for monthly items', () => {
    expect(monthlyEquivalent({ frequency: 'monthly', baseAmount: 100 })).toBe(100)
  })

  it('scales weekly items to a monthly equivalent', () => {
    expect(monthlyEquivalent({ frequency: 'weekly', baseAmount: 30 })).toBeCloseTo((30 * 52) / 12)
  })

  it('scales biweekly items to a monthly equivalent', () => {
    expect(monthlyEquivalent({ frequency: 'biweekly', baseAmount: 60 })).toBeCloseTo((60 * 26) / 12)
  })

  it('scales quarterly items down to a monthly equivalent', () => {
    expect(monthlyEquivalent({ frequency: 'quarterly', baseAmount: 90 })).toBeCloseTo(30)
  })

  it('scales semiannual items down to a monthly equivalent', () => {
    expect(monthlyEquivalent({ frequency: 'semiannual', baseAmount: 120 })).toBeCloseTo(20)
  })

  it('scales annual items down to a monthly equivalent', () => {
    expect(monthlyEquivalent({ frequency: 'annual', baseAmount: 1200 })).toBeCloseTo(100)
  })
})

describe('totalMonthlyExpensesByCurrency', () => {
  const envelopes = [
    { id: 'env-mercado', isSavings: false },
    { id: 'env-fondo-emergencia', isSavings: true },
  ]

  it('sums active items grouped by currency', () => {
    const items = [
      { envelopeId: 'env-mercado', isActive: true, frequency: 'monthly' as const, baseAmount: 300, currencyId: USDC_ID },
      { envelopeId: 'env-mercado', isActive: true, frequency: 'monthly' as const, baseAmount: 2000, currencyId: VES_ID },
    ]
    expect(totalMonthlyExpensesByCurrency(items, envelopes)).toEqual(
      expect.arrayContaining([
        { currencyId: USDC_ID, total: 300 },
        { currencyId: VES_ID, total: 2000 },
      ]),
    )
  })

  it('excludes items whose envelope is a savings envelope', () => {
    const items = [
      { envelopeId: 'env-mercado', isActive: true, frequency: 'monthly' as const, baseAmount: 300, currencyId: USDC_ID },
      { envelopeId: 'env-fondo-emergencia', isActive: true, frequency: 'monthly' as const, baseAmount: 50, currencyId: USDC_ID },
    ]
    expect(totalMonthlyExpensesByCurrency(items, envelopes)).toEqual([{ currencyId: USDC_ID, total: 300 }])
  })

  it('excludes inactive items', () => {
    const items = [
      { envelopeId: 'env-mercado', isActive: false, frequency: 'monthly' as const, baseAmount: 300, currencyId: USDC_ID },
    ]
    expect(totalMonthlyExpensesByCurrency(items, envelopes)).toEqual([])
  })
})

describe('consolidateMonthlyExpenses', () => {
  it('sums entries already in the dollar group', () => {
    const totals = [{ currencyId: USDC_ID, total: 300 }]
    expect(consolidateMonthlyExpenses(totals, DOLLAR_GROUP, [])).toEqual({ total: 300, missingCurrencyIds: [] })
  })

  it('converts other currencies using the latest rate', () => {
    const totals = [
      { currencyId: USDC_ID, total: 300 },
      { currencyId: VES_ID, total: 552 },
    ]
    const rates = [{ fromCurrencyId: USDC_ID, toCurrencyId: VES_ID, rate: 55.2, rateDate: '2026-07-01' }]
    expect(consolidateMonthlyExpenses(totals, DOLLAR_GROUP, rates)).toEqual({ total: 310, missingCurrencyIds: [] })
  })

  it('flags currencies with no rate instead of a misleading total', () => {
    const totals = [
      { currencyId: USDC_ID, total: 300 },
      { currencyId: VES_ID, total: 552 },
    ]
    expect(consolidateMonthlyExpenses(totals, DOLLAR_GROUP, [])).toEqual({
      total: null,
      missingCurrencyIds: [VES_ID],
    })
  })
})
