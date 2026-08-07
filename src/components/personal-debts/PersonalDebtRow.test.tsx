import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalDebtRow } from './PersonalDebtRow'
import type { PersonalDebt, PersonalDebtPayment, Currency, Wallet } from '@/types'

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

const DEBT: PersonalDebt = {
  id: 'pd1',
  userId: 'u1',
  debtorId: 'd1',
  direction: 'i_owe_them',
  description: 'Cena del viernes',
  currencyId: 'c1',
  originalAmount: 5,
  date: '2026-08-01',
  status: 'partial',
  isIndexed: false,
  indexCurrencyId: null,
  notes: null,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
}

const PAYMENT: PersonalDebtPayment = {
  id: 'pay1',
  userId: 'u1',
  personalDebtId: 'pd1',
  walletId: 'w1',
  amount: 4,
  currencyId: 'c1',
  paymentCurrencyId: 'c1',
  paymentAmount: 4,
  conversionRate: null,
  date: '2026-08-04',
  paymentType: 'payment',
  offsetGroupId: null,
  notes: null,
  createdAt: '2026-08-04',
}

const noop = { onAddPayment: vi.fn(), onDelete: vi.fn(), onDeletePayment: vi.fn() }

describe('PersonalDebtRow', () => {
  it('renders description, direction and outstanding amount', () => {
    render(
      <PersonalDebtRow debt={DEBT} currency={CURRENCY} outstanding={1} payments={[]} wallets={WALLETS} {...noop} />,
    )
    expect(screen.getByText('Cena del viernes')).toBeInTheDocument()
    expect(screen.getByText(/le debo/i)).toBeInTheDocument()
    expect(screen.getByText('$1,00 USD')).toBeInTheDocument()
  })

  it('hides payment history until expanded', async () => {
    render(
      <PersonalDebtRow
        debt={DEBT}
        currency={CURRENCY}
        outstanding={1}
        payments={[PAYMENT]}
        wallets={WALLETS}
        {...noop}
      />,
    )
    expect(screen.queryByText('Binance')).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(/expandir/i))
    expect(screen.getByText(/binance/i)).toBeInTheDocument()
  })

  it('distinguishes offset payments from regular payments', async () => {
    const offsetPayment = { ...PAYMENT, paymentType: 'offset' as const, walletId: null, offsetGroupId: 'og1' }
    render(
      <PersonalDebtRow
        debt={DEBT}
        currency={CURRENCY}
        outstanding={1}
        payments={[offsetPayment]}
        wallets={WALLETS}
        {...noop}
      />,
    )
    await userEvent.click(screen.getByLabelText(/expandir/i))
    expect(screen.getByText(/compensación/i)).toBeInTheDocument()
  })

  it('calls onAddPayment when the add button is clicked', async () => {
    const onAddPayment = vi.fn()
    render(
      <PersonalDebtRow
        debt={DEBT}
        currency={CURRENCY}
        outstanding={1}
        payments={[]}
        wallets={WALLETS}
        onAddPayment={onAddPayment}
        onDelete={vi.fn()}
        onDeletePayment={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByLabelText(/agregar pago/i))
    expect(onAddPayment).toHaveBeenCalledWith(DEBT)
  })

  it('hides the add payment button when the debt is paid', () => {
    render(
      <PersonalDebtRow
        debt={{ ...DEBT, status: 'paid' }}
        currency={CURRENCY}
        outstanding={0}
        payments={[]}
        wallets={WALLETS}
        {...noop}
      />,
    )
    expect(screen.queryByLabelText(/agregar pago/i)).not.toBeInTheDocument()
  })

  it('shows which currency the debt is indexed to when provided', () => {
    const usd: Currency = { ...CURRENCY, id: 'usd', code: 'USD' }
    render(
      <PersonalDebtRow
        debt={{ ...DEBT, isIndexed: true, indexCurrencyId: 'usd' }}
        currency={CURRENCY}
        indexCurrency={usd}
        outstanding={1}
        payments={[]}
        wallets={WALLETS}
        {...noop}
      />,
    )
    expect(screen.getByText('Indexada a USD')).toBeInTheDocument()
  })

  it('falls back to a plain "Indexada" badge when the index currency is not resolved', () => {
    render(
      <PersonalDebtRow
        debt={{ ...DEBT, isIndexed: true, indexCurrencyId: 'usd' }}
        currency={CURRENCY}
        outstanding={1}
        payments={[]}
        wallets={WALLETS}
        {...noop}
      />,
    )
    expect(screen.getByText('Indexada')).toBeInTheDocument()
  })

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(
      <PersonalDebtRow
        debt={DEBT}
        currency={CURRENCY}
        outstanding={1}
        payments={[]}
        wallets={WALLETS}
        onAddPayment={vi.fn()}
        onDelete={onDelete}
        onDeletePayment={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByLabelText(/eliminar deuda/i))
    expect(onDelete).toHaveBeenCalledWith(DEBT)
  })
})
