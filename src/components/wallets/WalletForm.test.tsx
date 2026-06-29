import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletForm } from './WalletForm'
import type { Currency } from '@/types'

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01' },
  { id: 'c2', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat', isActive: true, sortOrder: 2, createdAt: '2026-01-01' },
]

describe('WalletForm', () => {
  it('renders name and currency fields', () => {
    render(<WalletForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument()
  })

  it('shows validation error when submitting empty name', async () => {
    render(<WalletForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
  })

  it('shows credit limit field only when type is credit', async () => {
    render(<WalletForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText(/límite/i)).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText(/tipo/i), 'credit')
    expect(screen.getByLabelText(/límite/i)).toBeInTheDocument()
  })

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn()
    render(<WalletForm currencies={CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Zinli')
    await userEvent.selectOptions(screen.getByLabelText(/moneda/i), 'c1')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Zinli', currencyId: 'c1', type: 'asset' }),
    )
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<WalletForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills fields when editing an existing wallet', () => {
    const existing = {
      id: 'w1',
      name: 'Binance',
      currencyId: 'c1',
      type: 'asset' as const,
      creditLimit: null,
      balance: 150,
      notes: null,
    }
    render(<WalletForm currencies={CURRENCIES} initialValues={existing} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Binance')
  })
})
