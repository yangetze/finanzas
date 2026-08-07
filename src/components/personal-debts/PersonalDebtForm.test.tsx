import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalDebtForm } from './PersonalDebtForm'
import type { Currency } from '@/types'

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01' },
]

const VES: Currency = { id: 'c2', code: 'VES', name: 'Bolívar', symbol: 'Bs.', type: 'fiat', isActive: true, sortOrder: 2, createdAt: '2026-01-01' }
const EUR: Currency = { id: 'c3', code: 'EUR', name: 'Euro', symbol: '€', type: 'fiat', isActive: true, sortOrder: 3, createdAt: '2026-01-01' }
const MULTI_CURRENCIES: Currency[] = [...CURRENCIES, VES, EUR]

describe('PersonalDebtForm', () => {
  it('renders direction, description, currency and amount fields', () => {
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
  })

  it('shows validation error when description is empty', async () => {
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/monto/i), '5')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument()
  })

  it('shows validation error when amount is zero', async () => {
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Cena')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/monto debe ser mayor a cero/i)).toBeInTheDocument()
  })

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn()
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.selectOptions(screen.getByLabelText(/dirección/i), 'i_owe_them')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Cena del viernes')
    await userEvent.type(screen.getByLabelText(/monto/i), '5')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'i_owe_them',
        description: 'Cena del viernes',
        currencyId: 'c1',
        originalAmount: 5,
      }),
    )
  })

  it('defaults isIndexed to false and indexCurrencyId to null', async () => {
    const onSubmit = vi.fn()
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/descripción/i), 'Cena')
    await userEvent.type(screen.getByLabelText(/monto/i), '5')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ isIndexed: false, indexCurrencyId: null }))
  })

  it('does not show the index currency select until "Deuda indexada" is toggled on', () => {
    render(<PersonalDebtForm currencies={MULTI_CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText(/moneda índice/i)).not.toBeInTheDocument()
  })

  it('requires an index currency when indexed and none is available to pick', async () => {
    const onSubmit = vi.fn()
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/descripción/i), 'Préstamo')
    await userEvent.type(screen.getByLabelText(/monto/i), '100')
    await userEvent.click(screen.getByRole('switch'))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/moneda índice distinta/i)).toBeInTheDocument()
  })

  it('lets the user override the suggested index currency', async () => {
    const onSubmit = vi.fn()
    render(<PersonalDebtForm currencies={MULTI_CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/descripción/i), 'Préstamo')
    await userEvent.type(screen.getByLabelText(/monto/i), '100')
    await userEvent.click(screen.getByRole('switch'))
    // Suggested default is USD (c1); the user picks EUR (c3) instead.
    await userEvent.selectOptions(screen.getByLabelText(/moneda índice/i), 'c3')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ isIndexed: true, currencyId: 'c2', indexCurrencyId: 'c3' }),
    )
  })

  it('defaults the debt currency to VES and the index currency to USD on first toggle, for a new debt', async () => {
    const onSubmit = vi.fn()
    render(<PersonalDebtForm currencies={MULTI_CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/descripción/i), 'Préstamo')
    await userEvent.type(screen.getByLabelText(/monto/i), '100')
    await userEvent.click(screen.getByRole('switch'))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ isIndexed: true, currencyId: 'c2', indexCurrencyId: 'c1' }),
    )
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<PersonalDebtForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills fields when editing an existing debt', () => {
    render(
      <PersonalDebtForm
        currencies={CURRENCIES}
        initialValues={{
          direction: 'they_owe_me',
          description: 'Uber',
          currencyId: 'c1',
          originalAmount: 4,
          date: '2026-08-01',
          isIndexed: false,
          indexCurrencyId: null,
          notes: null,
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect((screen.getByLabelText(/descripción/i) as HTMLInputElement).value).toBe('Uber')
    expect((screen.getByLabelText(/monto/i) as HTMLInputElement).value).toBe('4')
  })
})
