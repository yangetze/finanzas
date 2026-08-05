import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/supabase', () => ({
  getLatestExchangeRate: vi.fn().mockResolvedValue(150),
}))

import { TransactionPayForm } from './TransactionPayForm'
import { getLatestExchangeRate } from '@/lib/supabase'
import type { Wallet, Currency } from '@/types'

const USD: Currency = {
  id: 'usd',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  type: 'fiat',
  isActive: true,
  sortOrder: 1,
  createdAt: '2026-01-01',
}

const VES: Currency = {
  id: 'ves',
  code: 'VES',
  name: 'Bolívar',
  symbol: 'Bs',
  type: 'fiat',
  isActive: true,
  sortOrder: 2,
  createdAt: '2026-01-01',
}

const CURRENCIES = [USD, VES]

const usdWallet: Wallet = {
  id: 'w-usd',
  userId: 'u1',
  name: 'Binance',
  currencyId: 'usd',
  type: 'asset',
  creditLimit: null,
  balance: 100,
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const vesWallet: Wallet = { ...usdWallet, id: 'w-ves', name: 'Efectivo Bs', currencyId: 'ves', balance: 3000 }

const WALLETS = [usdWallet, vesWallet]

describe('TransactionPayForm', () => {
  it('offers every wallet regardless of currency', () => {
    render(
      <TransactionPayForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} amount={30} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByRole('option', { name: 'Binance' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Efectivo Bs' })).toBeInTheDocument()
  })

  it('submits directly with no rate when the wallet matches the origin currency', async () => {
    const onSubmit = vi.fn()
    render(
      <TransactionPayForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} amount={30} onSubmit={onSubmit} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-usd')
    expect(screen.queryByLabelText(/tasa/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      walletId: 'w-usd',
      paymentCurrencyId: 'usd',
      paymentAmount: 30,
      conversionRate: null,
    })
  })

  it('shows an autofilled rate and preview when the wallet is in a different currency', async () => {
    render(
      <TransactionPayForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} amount={30} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')

    expect(getLatestExchangeRate).toHaveBeenCalledWith('ves', 'usd')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('150'))
    expect((screen.getByLabelText(/monto a pagar/i) as HTMLInputElement).value).toBe('4500')
  })

  it('submits the converted payment for a different-currency wallet', async () => {
    const onSubmit = vi.fn()
    render(
      <TransactionPayForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} amount={30} onSubmit={onSubmit} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('150'))

    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      walletId: 'w-ves',
      paymentCurrencyId: 'ves',
      paymentAmount: 4500,
      conversionRate: 150,
    })
  })

  it('shows a validation error without a selected wallet', async () => {
    render(
      <TransactionPayForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} amount={30} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))
    expect(screen.getByText(/debe seleccionar una billetera/i)).toBeInTheDocument()
  })

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    render(
      <TransactionPayForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} amount={30} onSubmit={vi.fn()} onCancel={onCancel} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
