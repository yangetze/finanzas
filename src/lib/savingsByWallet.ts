export interface SavingsEnvelopeEntry {
  envelopeId: string
  walletId: string | null
  accumulated: number
}

export interface WalletBalance {
  id: string
  name: string
  currencyId: string
  balance: number
}

export interface SavingsByWalletRow {
  walletId: string
  walletName: string
  currencyId: string
  planned: number
  actual: number
}

// Groups accumulated savings (is_savings envelopes) by the wallet their
// allocations point to, so it can be compared against that wallet's real
// balance — answers "¿dónde está guardado mi ahorro, y coincide con lo real?"
export function buildSavingsByWallet(
  entries: SavingsEnvelopeEntry[],
  wallets: WalletBalance[],
): SavingsByWalletRow[] {
  const planned = new Map<string, number>()
  for (const entry of entries) {
    if (!entry.walletId) continue
    planned.set(entry.walletId, (planned.get(entry.walletId) ?? 0) + entry.accumulated)
  }

  const rows: SavingsByWalletRow[] = []
  for (const [walletId, total] of planned) {
    const wallet = wallets.find((w) => w.id === walletId)
    if (!wallet) continue
    rows.push({ walletId, walletName: wallet.name, currencyId: wallet.currencyId, planned: total, actual: wallet.balance })
  }
  return rows
}
