import { describe, it, expect } from 'vitest'
import { netWorthByCurrency, monthlyExpenseSeries } from './dashboardSummary'

const VES_ID = 'cur-ves'
const USD_ID = 'cur-usd'

describe('netWorthByCurrency', () => {
  it('subtracts debts from assets in the same currency', () => {
    expect(
      netWorthByCurrency([{ currencyId: VES_ID, total: 1000 }], [{ currencyId: VES_ID, total: 300 }]),
    ).toEqual([{ currencyId: VES_ID, assets: 1000, debts: 300, net: 700 }])
  })

  it('keeps currencies with only assets (no debts)', () => {
    expect(netWorthByCurrency([{ currencyId: USD_ID, total: 50 }], [])).toEqual([
      { currencyId: USD_ID, assets: 50, debts: 0, net: 50 },
    ])
  })

  it('keeps currencies with only debts (no assets)', () => {
    expect(netWorthByCurrency([], [{ currencyId: VES_ID, total: 200 }])).toEqual([
      { currencyId: VES_ID, assets: 0, debts: 200, net: -200 },
    ])
  })

  it('returns an empty list when there is nothing on either side', () => {
    expect(netWorthByCurrency([], [])).toEqual([])
  })
})

describe('monthlyExpenseSeries', () => {
  const referenceDate = new Date(2026, 7, 6) // 2026-08-06

  it('returns one point per month, oldest first, for the requested window', () => {
    const series = monthlyExpenseSeries([], 3, referenceDate)
    expect(series.map((p) => p.yearMonth)).toEqual(['2026-06', '2026-07', '2026-08'])
  })

  it('sums paid expense transactions per currency within each month', () => {
    const transactions = [
      { date: '2026-08-01', status: 'pagado', type: 'expense', paymentCurrencyId: VES_ID, paymentAmount: 100 },
      { date: '2026-08-15', status: 'pagado', type: 'expense', paymentCurrencyId: VES_ID, paymentAmount: 50 },
      { date: '2026-08-10', status: 'pagado', type: 'expense', paymentCurrencyId: USD_ID, paymentAmount: 20 },
    ]
    const series = monthlyExpenseSeries(transactions, 1, referenceDate)
    expect(series).toEqual([
      {
        yearMonth: '2026-08',
        totalsByCurrency: expect.arrayContaining([
          { currencyId: VES_ID, total: 150 },
          { currencyId: USD_ID, total: 20 },
        ]),
      },
    ])
  })

  it('ignores transactions that are not paid expenses', () => {
    const transactions = [
      { date: '2026-08-01', status: 'pendiente', type: 'expense', paymentCurrencyId: VES_ID, paymentAmount: 100 },
      { date: '2026-08-01', status: 'pagado', type: 'income', paymentCurrencyId: VES_ID, paymentAmount: 500 },
    ]
    const series = monthlyExpenseSeries(transactions, 1, referenceDate)
    expect(series).toEqual([{ yearMonth: '2026-08', totalsByCurrency: [] }])
  })

  it('excludes transactions outside the requested month window', () => {
    const transactions = [
      { date: '2026-01-01', status: 'pagado', type: 'expense', paymentCurrencyId: VES_ID, paymentAmount: 999 },
    ]
    const series = monthlyExpenseSeries(transactions, 2, referenceDate)
    expect(series).toEqual([
      { yearMonth: '2026-07', totalsByCurrency: [] },
      { yearMonth: '2026-08', totalsByCurrency: [] },
    ])
  })
})
