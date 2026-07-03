import { describe, it, expect } from 'vitest'
import { sumByCurrency } from './budgetTotals'

const item = (currencyId: string, baseAmount: number) => ({ currencyId, baseAmount })

describe('sumByCurrency', () => {
  it('returns empty array for no items', () => {
    expect(sumByCurrency([])).toEqual([])
  })

  it('sums items of a single currency', () => {
    expect(sumByCurrency([item('usd', 100), item('usd', 50.5)])).toEqual([
      { currencyId: 'usd', total: 150.5 },
    ])
  })

  it('keeps totals separate per currency', () => {
    expect(sumByCurrency([item('usd', 100), item('ves', 3000), item('usd', 25)])).toEqual([
      { currencyId: 'usd', total: 125 },
      { currencyId: 'ves', total: 3000 },
    ])
  })

  it('preserves first-seen currency order', () => {
    expect(sumByCurrency([item('ves', 10), item('usd', 5)]).map((t) => t.currencyId)).toEqual([
      'ves',
      'usd',
    ])
  })
})
