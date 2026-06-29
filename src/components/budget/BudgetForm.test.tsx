import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetForm } from './BudgetForm'
import type { Envelope, Currency } from '@/types'

const ENVELOPES: Envelope[] = [
  {
    id: 'e1', userId: 'u1', parentId: null, name: 'Hogar', category: 'Hogar',
    priority: 'critico', emoji: '🏠', isActive: true, sortOrder: 1, notes: null,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
]

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01' },
]

describe('BudgetForm', () => {
  it('renders name, amount, envelope, spending-type fields', () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sobre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de gasto/i)).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct data', async () => {
    const onSubmit = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Inter')
    await userEvent.clear(screen.getByLabelText(/monto/i))
    await userEvent.type(screen.getByLabelText(/monto/i), '40')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Inter', baseAmount: 40 }),
    )
  })

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
