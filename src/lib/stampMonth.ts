export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'

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
  if (frequency === 'weekly' || frequency === 'biweekly' || frequency === 'monthly') return true
  const anchor = startMonth ?? 1
  if (frequency === 'quarterly') return (currentMonth - anchor) % 3 === 0
  if (frequency === 'semiannual') return (currentMonth - anchor) % 6 === 0
  return currentMonth === anchor
}

// Days of the month an item occurs on: weekly repeats every 7 days and
// biweekly every 15, starting at paymentDay; other frequencies occur once.
export function occurrenceDays(
  frequency: Frequency,
  paymentDay: number | null,
  daysInMonth: number,
): number[] {
  const start = Math.min(paymentDay ?? 1, daysInMonth)
  if (frequency !== 'weekly' && frequency !== 'biweekly') return [start]
  const step = frequency === 'weekly' ? 7 : 15
  const days: number[] = []
  for (let day = start; day <= daysInMonth; day += step) days.push(day)
  return days
}

export function buildStampedTransactions(
  items: BudgetItemStampInput[],
  alreadyStamped: Set<string>,
  yearMonth: string,
  _baseCurrencyId: string,
): StampedTransaction[] {
  const [yearStr, monthStr] = yearMonth.split('-')
  const currentMonth = parseInt(monthStr, 10)
  const daysInMonth = new Date(parseInt(yearStr, 10), currentMonth, 0).getDate()
  const result: StampedTransaction[] = []

  for (const item of items) {
    if (alreadyStamped.has(item.id)) continue
    if (!shouldStampThisMonth(item.frequency, item.startMonth, currentMonth)) continue

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

    for (const day of occurrenceDays(item.frequency, item.paymentDay, daysInMonth)) {
      result.push({
        budgetItemId: item.id,
        envelopeId: item.envelopeId,
        walletId: item.walletId,
        description: item.name,
        status: 'pendiente',
        date: `${yearMonth}-${String(day).padStart(2, '0')}`,
        originCurrencyId,
        originAmount,
        paymentCurrencyId,
        paymentAmount,
        conversionRate,
      })
    }
  }

  return result
}
