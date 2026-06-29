import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetItemRow } from './BudgetItemRow'
import type { BudgetItem, Currency } from '@/types'

const USD: Currency = {
  id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$',
  type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01',
}

const ITEM: BudgetItem = {
  id: 'b1',
  userId: 'u1',
  envelopeId: 'e1',
  walletId: null,
  name: 'Inter',
  baseAmount: 40,
  currencyId: 'c1',
  frequency: 'monthly',
  paymentDay: 15,
  startMonth: null,
  spendingType: 'supervivencia',
  isActive: true,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('BudgetItemRow', () => {
  it('renders name, amount and currency', () => {
    render(<BudgetItemRow item={ITEM} currency={USD} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText('Inter')).toBeInTheDocument()
    expect(screen.getByText(/40/)).toBeInTheDocument()
    expect(screen.getByText(/USD/)).toBeInTheDocument()
  })

  it('renders frequency label', () => {
    render(<BudgetItemRow item={ITEM} currency={USD} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText(/mensual/i)).toBeInTheDocument()
  })

  it('calls onEdit when edit clicked', async () => {
    const onEdit = vi.fn()
    render(<BudgetItemRow item={ITEM} currency={USD} onEdit={onEdit} onDeactivate={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(ITEM)
  })

  it('calls onDeactivate with id', async () => {
    const onDeactivate = vi.fn()
    render(<BudgetItemRow item={ITEM} currency={USD} onEdit={vi.fn()} onDeactivate={onDeactivate} />)
    await userEvent.click(screen.getByRole('button', { name: /desactivar/i }))
    expect(onDeactivate).toHaveBeenCalledWith('b1')
  })
})
