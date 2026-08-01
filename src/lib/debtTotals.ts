import { sumByCurrency, type CurrencyTotal } from './budgetTotals'

export interface DebtWallet {
  type: 'asset' | 'credit'
  isActive: boolean
  currencyId: string
  balance: number
}

// Baby Step 2 (pay off all debt): total owed per currency across every
// active credit wallet (TDC and Cashea alike — both are wallets.type = 'credit',
// and balance already IS the amount owed, same as on the Deudas page).
export function totalDebtByCurrency(wallets: DebtWallet[]): CurrencyTotal[] {
  const debts = wallets.filter((w) => w.type === 'credit' && w.isActive)
  return sumByCurrency(debts.map((w) => ({ currencyId: w.currencyId, baseAmount: w.balance }))).filter(
    (t) => t.total !== 0,
  )
}
