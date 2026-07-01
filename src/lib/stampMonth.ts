export type Frequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

export interface BudgetItemStampInput {
  id: string
  envelopeId: string
  walletId: string | null
  name: string
  baseAmount: number
  currencyId: string
  paymentCurrencyId: string | null
  referenceRate: number | null
  paymentDay: number | null
  frequency: Frequency
  startMonth: number | null
}

export interface StampedTransaction {
  budgetItemId: string
  envelopeId: string
  walletId: string | null
  description: string
  status: 'pendiente'
  date: string
  originCurrencyId: string
  originAmount: number
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: number | null
}

export function shouldStampThisMonth(
  frequency: Frequency,
  startMonth: number | null,
  currentMonth: number,
): boolean {
  if (frequency === 'monthly') return true
  const anchor = startMonth ?? 1
  if (frequency === 'quarterly') return (currentMonth - anchor) % 3 === 0
  if (frequency === 'semiannual') return (currentMonth - anchor) % 6 === 0
  return currentMonth === anchor
}

export function buildStampedTransactions(
  items: BudgetItemStampInput[],
  alreadyStamped: Set<string>,
  yearMonth: string,
  _baseCurrencyId: string,
): StampedTransaction[] {
  const currentMonth = parseInt(yearMonth.split('-')[1], 10)
  const result: StampedTransaction[] = []

  for (const item of items) {
    if (alreadyStamped.has(item.id)) continue
    if (!shouldStampThisMonth(item.frequency, item.startMonth, currentMonth)) continue

    const day = item.paymentDay ?? 1
    const date = `${yearMonth}-${String(day).padStart(2, '0')}`

    let originCurrencyId: string
    let originAmount: number
    let paymentCurrencyId: string
    let paymentAmount: number
    let conversionRate: number | null

    if (item.paymentCurrencyId !== null && item.referenceRate !== null) {
      originCurrencyId = item.paymentCurrencyId
      originAmount = item.baseAmount * item.referenceRate
      paymentCurrencyId = item.currencyId
      paymentAmount = item.baseAmount
      conversionRate = item.referenceRate
    } else {
      originCurrencyId = item.currencyId
      originAmount = item.baseAmount
      paymentCurrencyId = item.currencyId
      paymentAmount = item.baseAmount
      conversionRate = null
    }

    result.push({
      budgetItemId: item.id,
      envelopeId: item.envelopeId,
      walletId: item.walletId,
      description: item.name,
      status: 'pendiente',
      date,
      originCurrencyId,
      originAmount,
      paymentCurrencyId,
      paymentAmount,
      conversionRate,
    })
  }

  return result
}
