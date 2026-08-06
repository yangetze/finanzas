import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/supabase', () => ({
  getLatestExchangeRate: vi.fn().mockResolvedValue(150),
}))

import { PayCreditCardForm } from './PayCreditCardForm'
import { getLatestExchangeRate } from '@/lib/supabase'
import type { Wallet, Currency } from '@/types'

const USD: Currency = {
  id: 'usd', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01',
}
const VES: Currency = {
  id: 'ves', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat', isActive: true, sortOrder: 2, createdAt: '2026-01-01',
}
const CURRENCIES = [USD, VES]

const usdWallet: Wallet = {
  id: 'w-usd', userId: 'u1', name: 'Binance', currencyId: 'usd', type: 'asset',
  creditLimit: null, balance: 100, isActive: true, sortOrder: 1, notes: null,
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
}
const vesWallet: Wallet = { ...usdWallet, id: 'w-ves', name: 'Efectivo Bs', currencyId: 'ves', balance: 3000 }
const WALLETS = [usdWallet, vesWallet]

describe('PayCreditCardForm', () => {
  it('shows the outstanding balance and pre-fills the amount when the wallet matches the card currency', async () => {
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByText(/saldo pendiente/i)).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-usd')
    expect((screen.getByLabelText(/monto/i) as HTMLInputElement).value).toBe('35')
    expect(screen.queryByLabelText(/tasa/i)).not.toBeInTheDocument()
  })

  it('submits directly with no conversion when paying from a same-currency wallet', async () => {
    const onSubmit = vi.fn()
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={onSubmit} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-usd')
    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      walletId: 'w-usd',
      amount: 35,
      paymentCurrencyId: 'usd',
      paymentAmount: 35,
      conversionRate: null,
    })
  })

  it('shows an autofilled rate and preview when the wallet is in a different currency', async () => {
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')
    expect(getLatestExchangeRate).toHaveBeenCalledWith('ves', 'usd')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('150'))
    expect((screen.getByLabelText(/monto a pagar/i) as HTMLInputElement).value).toBe('5250')
  })

  it('submits the converted payment for a partial amount in a different currency', async () => {
    const onSubmit = vi.fn()
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={onSubmit} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('150'))

    const paymentInput = screen.getByLabelText(/monto a pagar/i)
    await userEvent.clear(paymentInput)
    await userEvent.type(paymentInput, '1500')
    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      walletId: 'w-ves',
      amount: 10,
      paymentCurrencyId: 'ves',
      paymentAmount: 1500,
      conversionRate: 150,
    })
  })

  it('shows a validation error when the amount exceeds the outstanding balance', async () => {
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-usd')
    const input = screen.getByLabelText(/monto/i)
    await userEvent.clear(input)
    await userEvent.type(input, '100')
    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))
    expect(screen.getByText(/no puede exceder el saldo pendiente/i)).toBeInTheDocument()
  })

  it('shows a validation error without a selected wallet', async () => {
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))
    expect(screen.getByText(/debe seleccionar una billetera/i)).toBeInTheDocument()
  })

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    render(
      <PayCreditCardForm wallets={WALLETS} currencies={CURRENCIES} currency={USD} outstanding={35} onSubmit={vi.fn()} onCancel={onCancel} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
