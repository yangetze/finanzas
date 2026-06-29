import { describe, it, expect } from 'vitest'
import { getApplicableItems, buildTransactionFromItem } from './monthOpener'
import type { BudgetItem } from '@/types'

const BASE_ITEM: BudgetItem = {
  id: 'b1',
  userId: 'u1',
  envelopeId: 'e1',
  walletId: 'w1',
  name: 'Netflix',
  baseAmount: 15,
  currencyId: 'c-usd',
  frequency: 'monthly',
  paymentDay: 10,
  startMonth: null,
  spendingType: 'flexible',
  isActive: true,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('getApplicableItems', () => {
  it('includes monthly items every month', () => {
    const items = [{ ...BASE_ITEM, frequency: 'monthly' as const }]
    expect(getApplicableItems(items, 1)).toHaveLength(1)
    expect(getApplicableItems(items, 6)).toHaveLength(1)
    expect(getApplicableItems(items, 12)).toHaveLength(1)
  })

  it('includes quarterly items every 3 months from startMonth', () => {
    const item = { ...BASE_ITEM, frequency: 'quarterly' as const, startMonth: 1 }
    expect(getApplicableItems([item], 1)).toHaveLength(1)
    expect(getApplicableItems([item], 4)).toHaveLength(1)
    expect(getApplicableItems([item], 7)).toHaveLength(1)
    expect(getApplicableItems([item], 10)).toHaveLength(1)
    expect(getApplicableItems([item], 2)).toHaveLength(0)
    expect(getApplicableItems([item], 5)).toHaveLength(0)
  })

  it('handles quarterly startMonth crossing year boundary', () => {
    const item = { ...BASE_ITEM, frequency: 'quarterly' as const, startMonth: 11 }
    expect(getApplicableItems([item], 11)).toHaveLength(1)
    expect(getApplicableItems([item], 2)).toHaveLength(1)
    expect(getApplicableItems([item], 5)).toHaveLength(1)
    expect(getApplicableItems([item], 8)).toHaveLength(1)
    expect(getApplicableItems([item], 1)).toHaveLength(0)
  })

  it('includes semiannual items every 6 months from startMonth', () => {
    const item = { ...BASE_ITEM, frequency: 'semiannual' as const, startMonth: 3 }
    expect(getApplicableItems([item], 3)).toHaveLength(1)
    expect(getApplicableItems([item], 9)).toHaveLength(1)
    expect(getApplicableItems([item], 4)).toHaveLength(0)
    expect(getApplicableItems([item], 6)).toHaveLength(0)
  })

  it('includes annual items only in startMonth', () => {
    const item = { ...BASE_ITEM, frequency: 'annual' as const, startMonth: 6 }
    expect(getApplicableItems([item], 6)).toHaveLength(1)
    expect(getApplicableItems([item], 5)).toHaveLength(0)
    expect(getApplicableItems([item], 7)).toHaveLength(0)
  })

  it('includes non-monthly item with null startMonth every applicable period', () => {
    const item = { ...BASE_ITEM, frequency: 'quarterly' as const, startMonth: null }
    expect(getApplicableItems([item], 1)).toHaveLength(1)
    expect(getApplicableItems([item], 2)).toHaveLength(1)
  })

  it('excludes inactive items', () => {
    const item = { ...BASE_ITEM, isActive: false }
    expect(getApplicableItems([item], 1)).toHaveLength(0)
  })
})

describe('buildTransactionFromItem', () => {
  it('builds a transaction payload with correct date', () => {
    const tx = buildTransactionFromItem(BASE_ITEM, 'u1', 2026, 6, 'c-usd')
    expect(tx.date).toBe('2026-06-10')
    expect(tx.description).toBe('Netflix')
    expect(tx.type).toBe('expense')
    expect(tx.status).toBe('apartado')
    expect(tx.originAmount).toBe(15)
    expect(tx.envelopeId).toBe('e1')
    expect(tx.walletId).toBe('w1')
    expect(tx.baseCurrencyId).toBe('c-usd')
  })

  it('defaults payment day to 1 when null', () => {
    const item = { ...BASE_ITEM, paymentDay: null }
    const tx = buildTransactionFromItem(item, 'u1', 2026, 6, 'c-usd')
    expect(tx.date).toBe('2026-06-01')
  })

  it('pads month and day with leading zeros', () => {
    const item = { ...BASE_ITEM, paymentDay: 5 }
    const tx = buildTransactionFromItem(item, 'u1', 2026, 3, 'c-usd')
    expect(tx.date).toBe('2026-03-05')
  })
})
