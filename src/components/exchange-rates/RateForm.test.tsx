import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RateForm } from './RateForm'
import type { Currency } from '@/types'

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01' },
  { id: 'c2', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat', isActive: true, sortOrder: 2, createdAt: '2026-01-01' },
]

describe('RateForm', () => {
  it('renders from/to currency selects and rate field', () => {
    render(<RateForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/desde/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hacia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tasa/i)).toBeInTheDocument()
  })

  it('shows validation error when rate is empty', async () => {
    render(<RateForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/tasa es requerida/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct data when valid', async () => {
    const onSubmit = vi.fn()
    render(<RateForm currencies={CURRENCIES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.selectOptions(screen.getByLabelText(/desde/i), 'c1')
    await userEvent.selectOptions(screen.getByLabelText(/hacia/i), 'c2')
    await userEvent.clear(screen.getByLabelText(/tasa/i))
    await userEvent.type(screen.getByLabelText(/tasa/i), '55.2')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fromCurrencyId: 'c1', toCurrencyId: 'c2', rate: 55.2 }),
    )
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    render(<RateForm currencies={CURRENCIES} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills when editing an existing rate', () => {
    const initial = {
      fromCurrencyId: 'c1',
      toCurrencyId: 'c2',
      rate: 55.2,
      rateDate: '2026-06-29',
      source: 'BCV',
    }
    render(<RateForm currencies={CURRENCIES} initialValues={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/tasa/i) as HTMLInputElement).value).toBe('55.2')
  })
})
