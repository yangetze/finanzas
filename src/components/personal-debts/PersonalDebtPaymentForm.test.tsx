import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/supabase', () => ({
  getLatestExchangeRate: vi.fn().mockResolvedValue(100),
}))

import { PersonalDebtPaymentForm } from './PersonalDebtPaymentForm'
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

const vesWallet: Wallet = {
  ...usdWallet,
  id: 'w-ves',
  name: 'Efectivo Bs',
  currencyId: 'ves',
  balance: 1000,
}

const WALLETS = [usdWallet, vesWallet]

describe('PersonalDebtPaymentForm — non-indexed debt', () => {
  it('filters wallet options to the debt currency', () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('option', { name: 'Binance' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Efectivo Bs' })).not.toBeInTheDocument()
  })

  it('does not show a rate field', () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByLabelText(/tasa/i)).not.toBeInTheDocument()
  })

  it('submits with paymentCurrencyId equal to currencyId and no conversion rate', async () => {
    const onSubmit = vi.fn()
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-usd')
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      walletId: 'w-usd',
      amount: 5,
      paymentCurrencyId: 'usd',
      paymentAmount: 5,
      conversionRate: null,
      date: expect.any(String),
      notes: null,
    })
  })
})

describe('PersonalDebtPaymentForm — indexed debt', () => {
  it('offers wallets in any currency', () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('option', { name: 'Binance' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Efectivo Bs' })).toBeInTheDocument()
  })

  it('shows a rate field, autofilled, once a wallet in a different currency is picked', async () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')

    expect(getLatestExchangeRate).toHaveBeenCalledWith('ves', 'usd')
    await waitFor(() => {
      expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('100')
    })
  })

  it('hides the rate field when the picked wallet matches the debt currency', async () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-usd')
    expect(screen.queryByLabelText(/tasa/i)).not.toBeInTheDocument()
  })

  it('computes the debt-currency amount from paymentAmount / rate on submit', async () => {
    const onSubmit = vi.fn()
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('100'))

    const paymentInput = screen.getByLabelText(/monto a pagar/i)
    await userEvent.clear(paymentInput)
    await userEvent.type(paymentInput, '400')
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      walletId: 'w-ves',
      amount: 4,
      paymentCurrencyId: 'ves',
      paymentAmount: 400,
      conversionRate: 100,
      date: expect.any(String),
      notes: null,
    })
  })

  it('lets the user override the autofilled rate', async () => {
    const onSubmit = vi.fn()
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('100'))

    const rateInput = screen.getByLabelText(/tasa/i)
    await userEvent.clear(rateInput)
    await userEvent.type(rateInput, '200')
    const paymentInput = screen.getByLabelText(/monto a pagar/i)
    await userEvent.clear(paymentInput)
    await userEvent.type(paymentInput, '400')
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ conversionRate: 200, amount: 2, paymentAmount: 400 }),
    )
  })

  it('shows a validation error when the converted amount exceeds outstanding', async () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currencies={CURRENCIES}
        currency={USD}
        outstanding={5}
        isIndexed
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w-ves')
    await waitFor(() => expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('100'))

    const paymentInput = screen.getByLabelText(/monto a pagar/i)
    await userEvent.clear(paymentInput)
    await userEvent.type(paymentInput, '1000')
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    expect(screen.getByText(/no puede exceder el saldo pendiente/i)).toBeInTheDocument()
  })
})
