import { describe, it, expect } from 'vitest'
import {
  totalMonthlyInvestmentByCurrency,
  averageMonthlyIncomeByCurrency,
  consolidateToDollarGroup,
} from './investing'

const USDC_ID = 'cur-usdc'
const VES_ID = 'cur-ves'
const DOLLAR_GROUP = new Set([USDC_ID])

describe('totalMonthlyInvestmentByCurrency', () => {
  const investmentIds = new Set(['env-bitcoin'])

  it('sums active items feeding investment-flagged envelopes', () => {
    const items = [
      { envelopeId: 'env-bitcoin', isActive: true, frequency: 'monthly' as const, baseAmount: 31, currencyId: USDC_ID },
      { envelopeId: 'env-bitcoin', isActive: true, frequency: 'monthly' as const, baseAmount: 20, currencyId: USDC_ID },
    ]
    expect(totalMonthlyInvestmentByCurrency(items, investmentIds)).toEqual([{ currencyId: USDC_ID, total: 51 }])
  })

  it('ignores items not feeding an investment-flagged envelope', () => {
    const items = [
      { envelopeId: 'env-mercado', isActive: true, frequency: 'monthly' as const, baseAmount: 300, currencyId: USDC_ID },
    ]
    expect(totalMonthlyInvestmentByCurrency(items, investmentIds)).toEqual([])
  })

  it('ignores inactive items', () => {
    const items = [
      { envelopeId: 'env-bitcoin', isActive: false, frequency: 'monthly' as const, baseAmount: 31, currencyId: USDC_ID },
    ]
    expect(totalMonthlyInvestmentByCurrency(items, investmentIds)).toEqual([])
  })

  it('normalizes non-monthly frequencies', () => {
    const items = [
      { envelopeId: 'env-bitcoin', isActive: true, frequency: 'annual' as const, baseAmount: 1200, currencyId: USDC_ID },
    ]
    expect(totalMonthlyInvestmentByCurrency(items, investmentIds)).toEqual([{ currencyId: USDC_ID, total: 100 }])
  })
})

describe('averageMonthlyIncomeByCurrency', () => {
  it('averages a single currency across observed months', () => {
    const entries = [
      { yearMonth: '2026-06', currencyId: USDC_ID, amount: 1700 },
      { yearMonth: '2026-07', currencyId: USDC_ID, amount: 1900 },
    ]
    expect(averageMonthlyIncomeByCurrency(entries)).toEqual([{ currencyId: USDC_ID, total: 1800 }])
  })

  it('divides each currency total by the full observed month count', () => {
    const entries = [
      { yearMonth: '2026-06', currencyId: USDC_ID, amount: 1700 },
      { yearMonth: '2026-07', currencyId: VES_ID, amount: 79450 },
    ]
    expect(averageMonthlyIncomeByCurrency(entries)).toEqual(
      expect.arrayContaining([
        { currencyId: USDC_ID, total: 850 },
        { currencyId: VES_ID, total: 39725 },
      ]),
    )
  })

  it('returns an empty list with no income history', () => {
    expect(averageMonthlyIncomeByCurrency([])).toEqual([])
  })
})

describe('consolidateToDollarGroup', () => {
  it('sums totals already in the dollar group', () => {
    const totals = [{ currencyId: USDC_ID, total: 300 }]
    expect(consolidateToDollarGroup(totals, DOLLAR_GROUP, [])).toEqual({ total: 300, missingCurrencyIds: [] })
  })

  it('converts other currencies using the latest rate', () => {
    const totals = [
      { currencyId: USDC_ID, total: 300 },
      { currencyId: VES_ID, total: 552 },
    ]
    const rates = [{ fromCurrencyId: USDC_ID, toCurrencyId: VES_ID, rate: 55.2, rateDate: '2026-07-01' }]
    expect(consolidateToDollarGroup(totals, DOLLAR_GROUP, rates)).toEqual({ total: 310, missingCurrencyIds: [] })
  })

  it('flags currencies with no rate instead of a misleading total', () => {
    const totals = [{ currencyId: VES_ID, total: 552 }]
    expect(consolidateToDollarGroup(totals, DOLLAR_GROUP, [])).toEqual({
      total: null,
      missingCurrencyIds: [VES_ID],
    })
  })
})
