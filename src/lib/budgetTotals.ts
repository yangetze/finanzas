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
