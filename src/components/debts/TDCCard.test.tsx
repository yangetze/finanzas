import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TDCCard } from './TDCCard'
import type { Wallet, Currency } from '@/types'

const CURRENCY: Currency = {
  id: 'c1',
  code: 'USDC',
  name: 'USD Coin',
  symbol: '$',
  type: 'stable',
  isActive: true,
  sortOrder: 1,
  createdAt: '2026-01-01',
}

const WALLET: Wallet = {
  id: 'w1',
  userId: 'u1',
  name: 'Visa Platinum',
  currencyId: 'c1',
  type: 'credit',
  creditLimit: 1000,
  balance: 350,
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('TDCCard', () => {
  it('renders wallet name', () => {
    render(<TDCCard wallet={WALLET} currency={CURRENCY} />)
    expect(screen.getByText('Visa Platinum')).toBeInTheDocument()
  })

  it('shows used and limit amounts', () => {
    render(<TDCCard wallet={WALLET} currency={CURRENCY} />)
    expect(screen.getByText(/350,00/)).toBeInTheDocument()
    expect(screen.getByText(/1\.000,00/)).toBeInTheDocument()
  })

  it('shows available amount', () => {
    render(<TDCCard wallet={WALLET} currency={CURRENCY} />)
    expect(screen.getByText(/650,00/)).toBeInTheDocument()
  })

  it('shows negative available when balance exceeds limit', () => {
    const overLimitWallet = { ...WALLET, balance: 1233.08, creditLimit: 1000 }
    render(<TDCCard wallet={overLimitWallet} currency={CURRENCY} />)
    expect(screen.getByText(/- \$ 233,08/)).toBeInTheDocument()
  })

  it('shows no limit text when creditLimit is null', () => {
    const wallet = { ...WALLET, creditLimit: null }
    render(<TDCCard wallet={wallet} currency={CURRENCY} />)
    expect(screen.getByText(/Sin límite/i)).toBeInTheDocument()
  })

  it('shows currency code', () => {
    render(<TDCCard wallet={WALLET} currency={CURRENCY} />)
    expect(screen.getByText('USDC')).toBeInTheDocument()
  })

  it('does not show a Pagar button when onPay is not provided', () => {
    render(<TDCCard wallet={WALLET} currency={CURRENCY} />)
    expect(screen.queryByRole('button', { name: /pagar/i })).not.toBeInTheDocument()
  })

  it('hides the Pagar button when nothing is owed', () => {
    const paidOff = { ...WALLET, balance: 0 }
    render(<TDCCard wallet={paidOff} currency={CURRENCY} onPay={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /pagar/i })).not.toBeInTheDocument()
  })

  it('calls onPay with the wallet when Pagar is clicked', async () => {
    const onPay = vi.fn()
    render(<TDCCard wallet={WALLET} currency={CURRENCY} onPay={onPay} />)
    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))
    expect(onPay).toHaveBeenCalledWith(WALLET)
  })
})
