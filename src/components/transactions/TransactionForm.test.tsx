import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionForm } from './TransactionForm'
import type { Envelope, Wallet, Currency } from '@/types'

vi.mock('@/lib/supabase', () => ({
  getLatestExchangeRate: vi.fn().mockResolvedValue(36),
}))

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

const FIAT_CURRENCY: Currency = {
  id: 'c2',
  code: 'VES',
  name: 'Bolívar',
  symbol: 'Bs.',
  type: 'fiat',
  isActive: true,
  sortOrder: 2,
  createdAt: '2026-01-01',
}

const ENVELOPE: Envelope = {
  id: 'e1',
  userId: 'u1',
  parentId: null,
  name: 'Suscripciones',
  spendCategory: null,
  emoji: null,
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const WALLET: Wallet = {
  id: 'w1',
  userId: 'u1',
  name: 'Binance USDC',
  currencyId: 'c1',
  type: 'asset',
  creditLimit: null,
  balance: 500,
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const noop = vi.fn()

describe('TransactionForm', () => {
  it('renders required fields', () => {
    render(
      <TransactionForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={noop}
        onCancel={noop}
      />,
    )
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
  })

  it('shows validation error when description is empty', async () => {
    const user = userEvent.setup()
    render(
      <TransactionForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={noop}
        onCancel={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument()
  })

  it('calls onSubmit with form values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <TransactionForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    )
    await user.clear(screen.getByLabelText(/descripción/i))
    await user.type(screen.getByLabelText(/descripción/i), 'Netflix')
    await user.clear(screen.getByLabelText(/monto/i))
    await user.type(screen.getByLabelText(/monto/i), '15')
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ description: 'Netflix', originAmount: 15 })
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <TransactionForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={noop}
        onCancel={onCancel}
      />,
    )
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows rate field when multiCurrency and fiat currency is selected', async () => {
    const user = userEvent.setup()
    render(
      <TransactionForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY, FIAT_CURRENCY]}
        multiCurrency
        baseCurrencyId="c1"
        onSubmit={noop}
        onCancel={noop}
      />,
    )
    await user.selectOptions(screen.getByLabelText(/moneda/i), 'c2')
    expect(await screen.findByLabelText(/tasa/i)).toBeInTheDocument()
  })

  it('pre-fills values when initialValues provided', () => {
    render(
      <TransactionForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        initialValues={{
          date: '2026-06-15',
          description: 'Netflix',
          type: 'expense',
          status: 'apartado',
          envelopeId: 'e1',
          walletId: 'w1',
          currencyId: 'c1',
          amount: 15,
          notes: 'nota',
        }}
        onSubmit={noop}
        onCancel={noop}
      />,
    )
    expect((screen.getByLabelText(/descripción/i) as HTMLInputElement).value).toBe('Netflix')
    expect((screen.getByLabelText(/monto/i) as HTMLInputElement).value).toBe('15')
  })
})
