import { describe, it, expect } from 'vitest'
import { convertToDollarGroup, consolidateEmergencyFund, isDollarEquivalent } from './emergencyFund'

const USDC_ID = 'cur-usdc'
const DOC_ID = 'cur-doc'
const USD_ID = 'cur-usd'
const VES_ID = 'cur-ves'

const DOLLAR_GROUP = new Set([USDC_ID, DOC_ID, USD_ID])

describe('isDollarEquivalent', () => {
  it('treats stablecoins as dollar-equivalent', () => {
    expect(isDollarEquivalent({ type: 'stable', code: 'USDC' })).toBe(true)
    expect(isDollarEquivalent({ type: 'stable', code: 'DOC' })).toBe(true)
  })

  it('treats fiat USD as dollar-equivalent', () => {
    expect(isDollarEquivalent({ type: 'fiat', code: 'USD' })).toBe(true)
  })

  it('does not treat VES or other fiat currencies as dollar-equivalent', () => {
    expect(isDollarEquivalent({ type: 'fiat', code: 'VES' })).toBe(false)
    expect(isDollarEquivalent({ type: 'fiat', code: 'EUR' })).toBe(false)
  })
})

describe('convertToDollarGroup', () => {
  it('returns the amount unchanged when already in the dollar group', () => {
    expect(convertToDollarGroup(100, USDC_ID, DOLLAR_GROUP, [])).toBe(100)
  })

  it('converts using a direct rate (source -> dollar-group currency)', () => {
    const rates = [{ fromCurrencyId: VES_ID, toCurrencyId: USDC_ID, rate: 0.02, rateDate: '2026-07-01' }]
    expect(convertToDollarGroup(1000, VES_ID, DOLLAR_GROUP, rates)).toBeCloseTo(20)
  })

  it('converts using an inverse rate (dollar-group currency -> source)', () => {
    const rates = [{ fromCurrencyId: USD_ID, toCurrencyId: VES_ID, rate: 55.2, rateDate: '2026-07-01' }]
    expect(convertToDollarGroup(552, VES_ID, DOLLAR_GROUP, rates)).toBeCloseTo(10)
  })

  it('picks the most recent rate when several are available', () => {
    const rates = [
      { fromCurrencyId: USD_ID, toCurrencyId: VES_ID, rate: 50, rateDate: '2026-06-01' },
      { fromCurrencyId: USD_ID, toCurrencyId: VES_ID, rate: 55, rateDate: '2026-07-15' },
    ]
    expect(convertToDollarGroup(55, VES_ID, DOLLAR_GROUP, rates)).toBeCloseTo(1)
  })

  it('returns null when no rate bridges the currency to the dollar group', () => {
    expect(convertToDollarGroup(1000, VES_ID, DOLLAR_GROUP, [])).toBeNull()
  })
})

describe('consolidateEmergencyFund', () => {
  it('sums entries already in the dollar group', () => {
    const entries = [
      { envelopeId: 'e1', currencyId: USD_ID, accumulated: 300 },
      { envelopeId: 'e2', currencyId: DOC_ID, accumulated: 150 },
    ]
    expect(consolidateEmergencyFund(entries, DOLLAR_GROUP, [])).toEqual({ total: 450, missingCurrencyIds: [] })
  })

  it('converts and includes VES when a rate is available', () => {
    const entries = [
      { envelopeId: 'e1', currencyId: USD_ID, accumulated: 300 },
      { envelopeId: 'e2', currencyId: VES_ID, accumulated: 552 },
    ]
    const rates = [{ fromCurrencyId: USD_ID, toCurrencyId: VES_ID, rate: 55.2, rateDate: '2026-07-01' }]
    expect(consolidateEmergencyFund(entries, DOLLAR_GROUP, rates)).toEqual({
      total: 310,
      missingCurrencyIds: [],
    })
  })

  it('returns a null total and lists the missing currency when no rate is available', () => {
    const entries = [
      { envelopeId: 'e1', currencyId: USD_ID, accumulated: 300 },
      { envelopeId: 'e2', currencyId: VES_ID, accumulated: 552 },
    ]
    expect(consolidateEmergencyFund(entries, DOLLAR_GROUP, [])).toEqual({
      total: null,
      missingCurrencyIds: [VES_ID],
    })
  })

  it('returns zero total for no entries', () => {
    expect(consolidateEmergencyFund([], DOLLAR_GROUP, [])).toEqual({ total: 0, missingCurrencyIds: [] })
  })
})
