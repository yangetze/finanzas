import type { BudgetItem } from '@/types'

export function getApplicableItems(items: BudgetItem[], month: number): BudgetItem[] {
  return items.filter((item) => item.isActive && isApplicable(item, month))
}

function isApplicable(item: BudgetItem, month: number): boolean {
  if (item.frequency === 'monthly') return true
  if (item.startMonth === null) return true
  const offset = ((month - item.startMonth + 12) % 12)
  const period = item.frequency === 'quarterly' ? 3 : item.frequency === 'semiannual' ? 6 : 12
  return offset % period === 0
}

export function buildTransactionFromItem(
  item: BudgetItem,
  userId: string,
  year: number,
  month: number,
  baseCurrencyId: string,
) {
  const day = item.paymentDay ?? 1
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return {
    userId,
    date,
    description: item.name,
    type: 'expense' as const,
    status: 'pendiente' as const,
    envelopeId: item.envelopeId,
    walletId: item.walletId,
    originCurrencyId: item.currencyId,
    originAmount: item.baseAmount,
    paymentCurrencyId: item.currencyId,
    paymentAmount: item.baseAmount,
    conversionRate: null,
    baseCurrencyId,
    baseAmount: item.baseAmount,
    baseRate: null,
    notes: item.notes,
  }
}
