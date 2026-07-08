import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionRow } from './TransactionRow'
import type { Transaction, Currency, Envelope } from '@/types'

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

const ENVELOPE: Envelope = {
  id: 'e1',
  userId: 'u1',
  parentId: null,
  name: 'Netflix',
  spendCategory: null, isSavings: false,
  emoji: '📱',
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const TX: Transaction = {
  id: 't1',
  userId: 'u1',
  walletId: 'w1',
  envelopeId: 'e1',
  date: '2026-06-15',
  description: 'Netflix junio',
  status: 'pagado',
  type: 'expense',
  originCurrencyId: 'c1',
  originAmount: 15,
  paymentCurrencyId: 'c1',
  paymentAmount: 15,
  conversionRate: null,
  baseCurrencyId: 'c1',
  baseAmount: 15,
  baseRate: null,
  budgetItemId: null,
  installmentNumber: null,
  installmentTotal: null,
  groupId: null,
  notes: null,
  createdAt: '2026-06-01',
  updatedAt: '2026-06-01',
}

const noop = vi.fn()

describe('TransactionRow', () => {
  it('renders description and amount', () => {
    render(<TransactionRow transaction={TX} currency={CURRENCY} onEdit={noop} onMarkPaid={noop} onDelete={noop} />)
    expect(screen.getByText('Netflix junio')).toBeInTheDocument()
    expect(screen.getByText(/15,00/)).toBeInTheDocument()
  })

  it('shows pagado badge for pagado status', () => {
    render(<TransactionRow transaction={TX} currency={CURRENCY} onEdit={noop} onMarkPaid={noop} onDelete={noop} />)
    expect(screen.getByText('Pagado')).toBeInTheDocument()
  })

  it('shows apartado badge for apartado status', () => {
    const tx = { ...TX, status: 'apartado' as const }
    render(<TransactionRow transaction={tx} currency={CURRENCY} onEdit={noop} onMarkPaid={noop} onDelete={noop} />)
    expect(screen.getByText('Apartado')).toBeInTheDocument()
  })

  it('shows envelope name when provided', () => {
    render(
      <TransactionRow
        transaction={TX}
        currency={CURRENCY}
        envelope={ENVELOPE}
        onEdit={noop}
        onMarkPaid={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getAllByText(/Netflix/).length).toBeGreaterThanOrEqual(2)
  })

  it('calls onMarkPaid when mark-paid button clicked for apartado transaction', async () => {
    const user = userEvent.setup()
    const onMarkPaid = vi.fn()
    const tx = { ...TX, status: 'apartado' as const }
    render(<TransactionRow transaction={tx} currency={CURRENCY} onEdit={noop} onMarkPaid={onMarkPaid} onDelete={noop} />)
    await user.click(screen.getByRole('button', { name: /pagar/i }))
    expect(onMarkPaid).toHaveBeenCalledWith('t1')
  })

  it('calls onEdit when edit button clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<TransactionRow transaction={TX} currency={CURRENCY} onEdit={onEdit} onMarkPaid={noop} onDelete={noop} />)
    await user.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(TX)
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<TransactionRow transaction={TX} currency={CURRENCY} onEdit={noop} onMarkPaid={noop} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /anular/i }))
    expect(onDelete).toHaveBeenCalledWith('t1')
  })
})
