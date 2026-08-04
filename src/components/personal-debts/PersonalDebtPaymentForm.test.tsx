import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalDebtPaymentForm } from './PersonalDebtPaymentForm'
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

const WALLETS: Wallet[] = [
  {
    id: 'w1',
    userId: 'u1',
    name: 'Binance',
    currencyId: 'c1',
    type: 'asset',
    creditLimit: null,
    balance: 100,
    isActive: true,
    sortOrder: 1,
    notes: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
]

describe('PersonalDebtPaymentForm', () => {
  it('shows outstanding balance and pre-fills amount with it', () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currency={CURRENCY}
        outstanding={5}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/saldo pendiente/i)).toBeInTheDocument()
    expect((screen.getByLabelText(/monto/i) as HTMLInputElement).value).toBe('5')
  })

  it('shows validation error when no wallet selected', async () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currency={CURRENCY}
        outstanding={5}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))
    expect(screen.getByText(/debe seleccionar una billetera/i)).toBeInTheDocument()
  })

  it('shows validation error when amount exceeds outstanding', async () => {
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currency={CURRENCY}
        outstanding={5}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w1')
    const amountInput = screen.getByLabelText(/monto/i)
    await userEvent.clear(amountInput)
    await userEvent.type(amountInput, '10')
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))
    expect(screen.getByText(/no puede exceder el saldo pendiente/i)).toBeInTheDocument()
  })

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn()
    render(
      <PersonalDebtPaymentForm
        wallets={WALLETS}
        currency={CURRENCY}
        outstanding={5}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w1')
    await userEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ walletId: 'w1', amount: 5 }))
  })
})
