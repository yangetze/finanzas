import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CasheaForm } from './CasheaForm'
import type { Envelope, Wallet, Currency } from '@/types'

const CURRENCY: Currency = {
  id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$',
  type: 'stable', isActive: true, sortOrder: 1, createdAt: '2026-01-01',
}

const ENVELOPE: Envelope = {
  id: 'e1', userId: 'u1', parentId: null, name: 'Ropa', category: 'Personal',
  priority: 'flexible', emoji: '👔', isActive: true, sortOrder: 1,
  notes: null, createdAt: '2026-01-01', updatedAt: '2026-01-01',
}

const WALLET: Wallet = {
  id: 'w1', userId: 'u1', name: 'Efectivo', currencyId: 'c1',
  type: 'asset', creditLimit: null, balance: 500, isActive: true,
  sortOrder: 1, notes: null, createdAt: '2026-01-01', updatedAt: '2026-01-01',
}

describe('CasheaForm', () => {
  it('renders description and amount fields', () => {
    render(
      <CasheaForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto total/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cuotas/i)).toBeInTheDocument()
  })

  it('shows validation error when description is empty', async () => {
    const user = userEvent.setup()
    render(
      <CasheaForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct number of transactions', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <CasheaForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await user.type(screen.getByLabelText(/descripción/i), 'Camisa Zara')
    await user.clear(screen.getByLabelText(/monto total/i))
    await user.type(screen.getByLabelText(/monto total/i), '90')
    await user.clear(screen.getByLabelText(/cuotas/i))
    await user.type(screen.getByLabelText(/cuotas/i), '3')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const txs = onSubmit.mock.calls[0][0]
    expect(txs).toHaveLength(3)
    expect(txs[0].installmentNumber).toBe(1)
    expect(txs[0].installmentTotal).toBe(3)
    expect(txs[1].installmentNumber).toBe(2)
    expect(txs[2].installmentNumber).toBe(3)
    // each installment = 90/3 = 30
    expect(txs[0].paymentAmount).toBeCloseTo(30)
  })

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <CasheaForm
        envelopes={[ENVELOPE]}
        wallets={[WALLET]}
        currencies={[CURRENCY]}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
