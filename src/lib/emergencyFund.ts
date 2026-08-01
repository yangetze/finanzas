export interface RateRow {
  fromCurrencyId: string
  toCurrencyId: string
  rate: number
  rateDate: string
}

export interface EmergencyFundEntry {
  envelopeId: string
  currencyId: string
  accumulated: number
}

export interface EmergencyFundResult {
  total: number | null
  missingCurrencyIds: string[]
}

// Stablecoins are 1:1 with USD by project convention (no conversion between
// them), so fiat USD joins the same "dollar group" as USDC/USDt/DOC. Any
// other currency (VES, EUR, ...) needs a real stored rate to bridge in.
export function isDollarEquivalent(currency: { type: string; code: string }): boolean {
  return currency.type === 'stable' || currency.code === 'USD'
}

export function convertToDollarGroup(
  amount: number,
  currencyId: string,
  dollarGroupIds: Set<string>,
  rates: RateRow[],
): number | null {
  if (dollarGroupIds.has(currencyId)) return amount

  const candidates = rates.filter(
    (r) =>
      (r.fromCurrencyId === currencyId && dollarGroupIds.has(r.toCurrencyId)) ||
      (dollarGroupIds.has(r.fromCurrencyId) && r.toCurrencyId === currencyId),
  )
  if (candidates.length === 0) return null

  const latest = candidates.reduce((a, b) => (a.rateDate >= b.rateDate ? a : b))
  return latest.fromCurrencyId === currencyId ? amount * latest.rate : amount / latest.rate
}

export function consolidateEmergencyFund(
  entries: EmergencyFundEntry[],
  dollarGroupIds: Set<string>,
  rates: RateRow[],
): EmergencyFundResult {
  let total = 0
  const missing = new Set<string>()

  for (const entry of entries) {
    const converted = convertToDollarGroup(entry.accumulated, entry.currencyId, dollarGroupIds, rates)
    if (converted === null) {
      missing.add(entry.currencyId)
      continue
    }
    total += converted
  }

  return { total: missing.size > 0 ? null : total, missingCurrencyIds: [...missing] }
}
