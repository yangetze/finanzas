import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCard } from './WalletCard'
import type { Wallet, Currency } from '@/types'

const CURRENCY: Currency = {
  id: 'c1',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  type: 'fiat',
  isActive: true,
  sortOrder: 1,
  createdAt: '2026-01-01',
}

const ASSET_WALLET: Wallet = {
  id: 'w1',
  userId: 'u1',
  name: 'Binance',
  currencyId: 'c1',
  type: 'asset',
  creditLimit: null,
  balance: 150.5,
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const CREDIT_WALLET: Wallet = {
  ...ASSET_WALLET,
  id: 'w2',
  name: 'Visa Gold',
  type: 'credit',
  creditLimit: 1000,
  balance: -250,
}

describe('WalletCard', () => {
  it('renders wallet name and balance', () => {
    render(<WalletCard wallet={ASSET_WALLET} currency={CURRENCY} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText('Binance')).toBeInTheDocument()
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('renders currency symbol', () => {
    render(<WalletCard wallet={ASSET_WALLET} currency={CURRENCY} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText(/\$/)).toBeInTheDocument()
  })

  it('shows credit limit row for credit type', () => {
    render(<WalletCard wallet={CREDIT_WALLET} currency={CURRENCY} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText(/límite/i)).toBeInTheDocument()
    expect(screen.getByText(/1[,.]?000/)).toBeInTheDocument()
  })

  it('does not show credit limit for asset type', () => {
    render(<WalletCard wallet={ASSET_WALLET} currency={CURRENCY} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.queryByText(/límite/i)).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<WalletCard wallet={ASSET_WALLET} currency={CURRENCY} onEdit={onEdit} onDeactivate={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(ASSET_WALLET)
  })

  it('calls onDeactivate when deactivate button is clicked', async () => {
    const onDeactivate = vi.fn()
    render(<WalletCard wallet={ASSET_WALLET} currency={CURRENCY} onEdit={vi.fn()} onDeactivate={onDeactivate} />)
    await userEvent.click(screen.getByRole('button', { name: /desactivar/i }))
    expect(onDeactivate).toHaveBeenCalledWith('w1')
  })
})
