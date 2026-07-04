import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IncomeRow } from './IncomeRow'
import type { Transaction, Currency, Wallet } from '@/types'

const CURRENCY: Currency = {
  id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', isActive: true, sortOrder: 1, createdAt: '',
}

const WALLET: Wallet = {
  id: 'w1', userId: 'u1', name: 'Binance', currencyId: 'c1', type: 'asset', creditLimit: null, balance: 100, sortOrder: 1, notes: null, isActive: true, createdAt: '', updatedAt: '',
}

function makeIncome(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    userId: 'u1',
    walletId: 'w1',
    envelopeId: null,
    date: '2026-07-04',
    description: 'Salario',
    status: 'pagado',
    type: 'income',
    originCurrencyId: 'c1',
    originAmount: 1500,
    paymentCurrencyId: 'c1',
    paymentAmount: 1500,
    conversionRate: null,
    baseCurrencyId: 'c1',
    baseAmount: 1500,
    baseRate: null,
    budgetItemId: null,
    installmentNumber: null,
    installmentTotal: null,
    groupId: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('IncomeRow', () => {
  it('shows description, positive amount and Recibido badge when pagado', () => {
    render(
      <IncomeRow income={makeIncome()} currency={CURRENCY} wallet={WALLET} onEdit={vi.fn()} onMarkReceived={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Salario')).toBeInTheDocument()
    expect(screen.getByText(/\+\$ 1\.500,00/)).toBeInTheDocument()
    expect(screen.getByText('Recibido')).toBeInTheDocument()
    expect(screen.getByText('Binance')).toBeInTheDocument()
  })

  it('shows Pendiente badge and a Recibir action when pendiente', async () => {
    const onMarkReceived = vi.fn()
    render(
      <IncomeRow income={makeIncome({ status: 'pendiente' })} currency={CURRENCY} wallet={WALLET} onEdit={vi.fn()} onMarkReceived={onMarkReceived} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /recibir/i }))
    expect(onMarkReceived).toHaveBeenCalledWith('t1')
  })

  it('does not show Recibir action when already received', () => {
    render(
      <IncomeRow income={makeIncome()} currency={CURRENCY} wallet={WALLET} onEdit={vi.fn()} onMarkReceived={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.queryByRole('button', { name: /recibir/i })).not.toBeInTheDocument()
  })

  it('fires edit and delete callbacks', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const income = makeIncome()
    render(
      <IncomeRow income={income} currency={CURRENCY} wallet={WALLET} onEdit={onEdit} onMarkReceived={vi.fn()} onDelete={onDelete} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(income)
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith('t1')
  })
})
