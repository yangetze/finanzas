import { describe, it, expect } from 'vitest'
import { sumByCurrency, isMissingRateForSingleCurrencySum } from './budgetTotals'

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

describe('isMissingRateForSingleCurrencySum', () => {
  const currencies = [
    { id: 'usdc', type: 'stable' },
    { id: 'usdt', type: 'stable' },
    { id: 'ves', type: 'fiat' },
    { id: 'eur', type: 'fiat' },
  ]
  const rate = (fromCurrencyId: string, toCurrencyId: string) => ({ fromCurrencyId, toCurrencyId })

  it('returns false when all items share one currency', () => {
    expect(isMissingRateForSingleCurrencySum([item('ves', 10)], currencies, [])).toBe(false)
  })

  it('returns false when items only span stablecoins (1:1, no rate needed)', () => {
    expect(
      isMissingRateForSingleCurrencySum([item('usdc', 10), item('usdt', 5)], currencies, []),
    ).toBe(false)
  })

  it('returns true when currencies differ and no rate exists', () => {
    expect(
      isMissingRateForSingleCurrencySum([item('usdc', 10), item('ves', 3000)], currencies, []),
    ).toBe(true)
  })

  it('returns false when a rate connects the currencies', () => {
    expect(
      isMissingRateForSingleCurrencySum([item('usdc', 10), item('ves', 3000)], currencies, [
        rate('usdc', 'ves'),
      ]),
    ).toBe(false)
  })

  it('accepts the rate in either direction', () => {
    expect(
      isMissingRateForSingleCurrencySum([item('usdc', 10), item('ves', 3000)], currencies, [
        rate('ves', 'usdc'),
      ]),
    ).toBe(false)
  })

  it('a stablecoin rate covers all stablecoins in the group', () => {
    expect(
      isMissingRateForSingleCurrencySum([item('usdt', 10), item('ves', 3000)], currencies, [
        rate('usdc', 'ves'),
      ]),
    ).toBe(false)
  })

  it('returns true when only some pairs are covered', () => {
    expect(
      isMissingRateForSingleCurrencySum(
        [item('usdc', 10), item('ves', 3000), item('eur', 20)],
        currencies,
        [rate('usdc', 'ves')],
      ),
    ).toBe(true)
  })
})
