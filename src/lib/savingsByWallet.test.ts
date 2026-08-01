import { describe, it, expect } from 'vitest'
import { buildSavingsByWallet } from './savingsByWallet'

describe('buildSavingsByWallet', () => {
  const wallets = [
    { id: 'w1', name: 'Bitget Earn USDt', currencyId: 'usdt', balance: 150 },
    { id: 'w2', name: 'Belo', currencyId: 'doc', balance: 80 },
  ]

  it('sums accumulated savings per wallet', () => {
    const entries = [
      { envelopeId: 'e1', walletId: 'w1', accumulated: 100 },
      { envelopeId: 'e2', walletId: 'w1', accumulated: 50 },
    ]
    expect(buildSavingsByWallet(entries, wallets)).toEqual([
      { walletId: 'w1', walletName: 'Bitget Earn USDt', currencyId: 'usdt', planned: 150, actual: 150 },
    ])
  })

  it('flags a mismatch between planned and actual balance', () => {
    const entries = [{ envelopeId: 'e1', walletId: 'w2', accumulated: 30 }]
    expect(buildSavingsByWallet(entries, wallets)).toEqual([
      { walletId: 'w2', walletName: 'Belo', currencyId: 'doc', planned: 30, actual: 80 },
    ])
  })

  it('ignores entries without a wallet', () => {
    const entries = [{ envelopeId: 'e1', walletId: null, accumulated: 100 }]
    expect(buildSavingsByWallet(entries, wallets)).toEqual([])
  })

  it('ignores entries pointing to a wallet that no longer exists', () => {
    const entries = [{ envelopeId: 'e1', walletId: 'missing', accumulated: 100 }]
    expect(buildSavingsByWallet(entries, wallets)).toEqual([])
  })

  it('returns an empty list for no entries', () => {
    expect(buildSavingsByWallet([], wallets)).toEqual([])
  })
})
