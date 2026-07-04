import { describe, it, expect } from 'vitest'
import { incomeEditBalanceDeltas } from './balanceDeltas'

describe('incomeEditBalanceDeltas', () => {
  it('credits the wallet when status changes pendiente → pagado', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pendiente', walletId: 'w1', amount: 1700 },
        { status: 'pagado', walletId: 'w1', amount: 1700 },
      ),
    ).toEqual([{ walletId: 'w1', delta: 1700 }])
  })

  it('debits the wallet when status changes pagado → pendiente', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pagado', walletId: 'w1', amount: 1700 },
        { status: 'pendiente', walletId: 'w1', amount: 1700 },
      ),
    ).toEqual([{ walletId: 'w1', delta: -1700 }])
  })

  it('applies the net difference when a received amount changes', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pagado', walletId: 'w1', amount: 100 },
        { status: 'pagado', walletId: 'w1', amount: 120 },
      ),
    ).toEqual([{ walletId: 'w1', delta: 20 }])
  })

  it('moves the credit when the wallet changes on a received income', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pagado', walletId: 'w1', amount: 100 },
        { status: 'pagado', walletId: 'w2', amount: 100 },
      ),
    ).toEqual([
      { walletId: 'w1', delta: -100 },
      { walletId: 'w2', delta: 100 },
    ])
  })

  it('returns nothing when a pendiente income stays pendiente', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pendiente', walletId: 'w1', amount: 100 },
        { status: 'pendiente', walletId: 'w1', amount: 200 },
      ),
    ).toEqual([])
  })

  it('returns nothing when nothing relevant changes', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pagado', walletId: 'w1', amount: 100 },
        { status: 'pagado', walletId: 'w1', amount: 100 },
      ),
    ).toEqual([])
  })

  it('ignores sides without a wallet', () => {
    expect(
      incomeEditBalanceDeltas(
        { status: 'pagado', walletId: null, amount: 100 },
        { status: 'pagado', walletId: 'w2', amount: 100 },
      ),
    ).toEqual([{ walletId: 'w2', delta: 100 }])
  })
})
