import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransferRow } from './TransferRow'
import type { Transfer, Currency, Wallet } from '@/types'

const USDC: Currency = { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', isActive: true, sortOrder: 1, createdAt: '' }
const USDT: Currency = { id: 'c2', code: 'USDT', name: 'Tether', symbol: '$', type: 'stable', isActive: true, sortOrder: 2, createdAt: '' }

const FROM: Wallet = { id: 'w1', userId: 'u1', name: 'Binance', currencyId: 'c1', type: 'asset', creditLimit: null, balance: 100, sortOrder: 1, notes: null, isActive: true, createdAt: '', updatedAt: '' }
const TO: Wallet = { id: 'w2', userId: 'u1', name: 'Zinli', currencyId: 'c2', type: 'asset', creditLimit: null, balance: 0, sortOrder: 2, notes: null, isActive: true, createdAt: '', updatedAt: '' }

function makeTransfer(overrides: Partial<Transfer> = {}): Transfer {
  return {
    id: 'tr1',
    userId: 'u1',
    date: '2026-07-04',
    fromWalletId: 'w1',
    toWalletId: 'w2',
    fromCurrencyId: 'c1',
    toCurrencyId: 'c2',
    amountSent: 70,
    commission: 5,
    amountReceived: 65,
    commissionTransactionId: 'tx1',
    notes: null,
    createdAt: '',
    ...overrides,
  }
}

describe('TransferRow', () => {
  it('shows wallets, amounts and commission', () => {
    render(
      <TransferRow
        transfer={makeTransfer()}
        fromWallet={FROM}
        toWallet={TO}
        fromCurrency={USDC}
        toCurrency={USDT}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText(/Binance/)).toBeInTheDocument()
    expect(screen.getByText(/Zinli/)).toBeInTheDocument()
    expect(screen.getByText(/−\$ 70,00/)).toBeInTheDocument()
    expect(screen.getByText(/\+\$ 65,00/)).toBeInTheDocument()
    expect(screen.getByText(/comisión \$ 5,00/i)).toBeInTheDocument()
  })

  it('hides commission when zero', () => {
    render(
      <TransferRow
        transfer={makeTransfer({ commission: 0, commissionTransactionId: null, amountReceived: 70 })}
        fromWallet={FROM}
        toWallet={TO}
        fromCurrency={USDC}
        toCurrency={USDT}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryByText(/comisión/i)).not.toBeInTheDocument()
  })

  it('fires onDelete with the transfer', async () => {
    const onDelete = vi.fn()
    const transfer = makeTransfer()
    render(
      <TransferRow
        transfer={transfer}
        fromWallet={FROM}
        toWallet={TO}
        fromCurrency={USDC}
        toCurrency={USDT}
        onDelete={onDelete}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith(transfer)
  })
})
