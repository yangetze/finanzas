import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetForm } from './BudgetForm'
import type { Envelope, Currency, Wallet } from '@/types'

const ENVELOPES: Envelope[] = [
  {
    id: 'e1', userId: 'u1', parentId: null, name: 'Hogar',
    spendCategory: null, isSavings: false, emoji: '🏠', isActive: true, sortOrder: 1, notes: null,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
]

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01' },
]

const WALLETS: Wallet[] = [
  {
    id: 'w1', userId: 'u1', name: 'Binance USDC', currencyId: 'c1',
    type: 'asset', creditLimit: null, balance: 500, isActive: true,
    sortOrder: 1, notes: null, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
]

describe('BudgetForm', () => {
  it('renders name, amount, envelope, spending-type fields', () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sobre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de gasto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/billetera/i)).toBeInTheDocument()
  })

  it('shows placeholder option in envelope select', () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('option', { name: /seleccione un sobre/i })).toBeInTheDocument()
  })

  it('auto-fills name from envelope when name is empty and envelope is selected', async () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Hogar')
  })

  it('does not overwrite name when already filled', async () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Alquiler')
    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Alquiler')
  })

  it('shows validation error when name is empty', async () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
  })

  it('calls onSubmit with walletId when wallet selected', async () => {
    const onSubmit = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    await userEvent.clear(screen.getByLabelText(/nombre/i))
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Inter')
    await userEvent.clear(screen.getByLabelText(/monto/i))
    await userEvent.type(screen.getByLabelText(/monto/i), '40')
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w1')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Inter', baseAmount: 40, walletId: 'w1' }),
    )
  })

  it('calls onSubmit with null walletId when no wallet selected', async () => {
    const onSubmit = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ walletId: null }),
    )
  })

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('hides the month selector for monthly, weekly and biweekly frequencies', async () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText(/^mes$/i)).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText(/frecuencia/i), 'weekly')
    expect(screen.queryByLabelText(/^mes$/i)).not.toBeInTheDocument()
  })

  it('shows the month selector for annual, semiannual and quarterly frequencies', async () => {
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.selectOptions(screen.getByLabelText(/frecuencia/i), 'annual')
    expect(screen.getByLabelText(/^mes$/i)).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText(/frecuencia/i), 'quarterly')
    expect(screen.getByLabelText(/^mes$/i)).toBeInTheDocument()
  })

  it('requires a month for annual items', async () => {
    const onSubmit = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    await userEvent.selectOptions(screen.getByLabelText(/frecuencia/i), 'annual')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/el mes es requerido/i)).toBeInTheDocument()
  })

  it('submits startMonth for annual items', async () => {
    const onSubmit = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    await userEvent.selectOptions(screen.getByLabelText(/frecuencia/i), 'annual')
    await userEvent.selectOptions(screen.getByLabelText(/^mes$/i), '3')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ frequency: 'annual', startMonth: 3 }),
    )
  })

  it('submits null startMonth for monthly items', async () => {
    const onSubmit = vi.fn()
    render(<BudgetForm envelopes={ENVELOPES} currencies={CURRENCIES} wallets={WALLETS} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.selectOptions(screen.getByLabelText(/sobre/i), 'e1')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ frequency: 'monthly', startMonth: null }),
    )
  })
})
