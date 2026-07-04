interface IncomeBalanceState {
  status: string
  walletId: string | null
  amount: number
}

export interface WalletDelta {
  walletId: string
  delta: number
}

// Reverse-and-reapply: undo the credit the old state produced (if any),
// apply the credit the new state produces (if any), then net out per wallet.
export function incomeEditBalanceDeltas(
  oldState: IncomeBalanceState,
  newState: IncomeBalanceState,
): WalletDelta[] {
  const deltas = new Map<string, number>()

  if (oldState.status === 'pagado' && oldState.walletId) {
    deltas.set(oldState.walletId, (deltas.get(oldState.walletId) ?? 0) - oldState.amount)
  }
  if (newState.status === 'pagado' && newState.walletId) {
    deltas.set(newState.walletId, (deltas.get(newState.walletId) ?? 0) + newState.amount)
  }

  return [...deltas.entries()]
    .filter(([, delta]) => delta !== 0)
    .map(([walletId, delta]) => ({ walletId, delta }))
}
