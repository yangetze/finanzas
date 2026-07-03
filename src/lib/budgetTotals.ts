export interface CurrencyTotal {
  currencyId: string
  total: number
}

export function sumByCurrency(items: { currencyId: string; baseAmount: number }[]): CurrencyTotal[] {
  const totals: CurrencyTotal[] = []
  for (const item of items) {
    const existing = totals.find((t) => t.currencyId === item.currencyId)
    if (existing) existing.total += item.baseAmount
    else totals.push({ currencyId: item.currencyId, total: item.baseAmount })
  }
  return totals
}

const STABLE_GROUP = '__stable__'

// Stablecoins are 1:1 with USD, so they form a single group that needs no
// rate among themselves; a rate involving any member covers the whole group.
export function isMissingRateForSingleCurrencySum(
  items: { currencyId: string }[],
  currencies: { id: string; type: string }[],
  rates: { fromCurrencyId: string; toCurrencyId: string }[],
): boolean {
  const groupOf = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    return currency?.type === 'stable' ? STABLE_GROUP : currencyId
  }

  const groups = [...new Set(items.map((i) => groupOf(i.currencyId)))]
  if (groups.length <= 1) return false

  const connected = (groupA: string, groupB: string) =>
    rates.some(
      (r) =>
        (groupOf(r.fromCurrencyId) === groupA && groupOf(r.toCurrencyId) === groupB) ||
        (groupOf(r.fromCurrencyId) === groupB && groupOf(r.toCurrencyId) === groupA),
    )

  for (let a = 0; a < groups.length; a++) {
    for (let b = a + 1; b < groups.length; b++) {
      if (!connected(groups[a], groups[b])) return true
    }
  }
  return false
}
