import { describe, it, expect } from 'vitest'
import { totalDebtByCurrency } from './debtTotals'

const VES_ID = 'cur-ves'
const USD_ID = 'cur-usd'

describe('totalDebtByCurrency', () => {
  it('sums balances across credit wallets in the same currency', () => {
    const wallets = [
      { type: 'credit' as const, isActive: true, currencyId: VES_ID, balance: 300 },
      { type: 'credit' as const, isActive: true, currencyId: VES_ID, balance: 150 },
    ]
    expect(totalDebtByCurrency(wallets)).toEqual([{ currencyId: VES_ID, total: 450 }])
  })

  it('keeps different currencies separate', () => {
    const wallets = [
      { type: 'credit' as const, isActive: true, currencyId: VES_ID, balance: 300 },
      { type: 'credit' as const, isActive: true, currencyId: USD_ID, balance: 50 },
    ]
    expect(totalDebtByCurrency(wallets)).toEqual(
      expect.arrayContaining([
        { currencyId: VES_ID, total: 300 },
        { currencyId: USD_ID, total: 50 },
      ]),
    )
  })

  it('ignores asset wallets', () => {
    const wallets = [
      { type: 'asset' as const, isActive: true, currencyId: VES_ID, balance: 1000 },
      { type: 'credit' as const, isActive: true, currencyId: VES_ID, balance: 300 },
    ]
    expect(totalDebtByCurrency(wallets)).toEqual([{ currencyId: VES_ID, total: 300 }])
  })

  it('ignores inactive credit wallets', () => {
    const wallets = [
      { type: 'credit' as const, isActive: false, currencyId: VES_ID, balance: 300 },
      { type: 'credit' as const, isActive: true, currencyId: VES_ID, balance: 100 },
    ]
    expect(totalDebtByCurrency(wallets)).toEqual([{ currencyId: VES_ID, total: 100 }])
  })

  it('drops currencies fully paid off', () => {
    const wallets = [{ type: 'credit' as const, isActive: true, currencyId: VES_ID, balance: 0 }]
    expect(totalDebtByCurrency(wallets)).toEqual([])
  })

  it('returns an empty list when there are no credit wallets', () => {
    expect(totalDebtByCurrency([])).toEqual([])
  })
})
