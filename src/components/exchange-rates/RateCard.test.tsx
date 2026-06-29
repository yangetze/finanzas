import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RateCard } from './RateCard'
import type { ExchangeRate, Currency } from '@/types'

const USD: Currency = {
  id: 'c1', code: 'USD', name: 'US Dollar', symbol: '$',
  type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01',
}
const VES: Currency = {
  id: 'c2', code: 'VES', name: 'Bolívar', symbol: 'Bs',
  type: 'fiat', isActive: true, sortOrder: 2, createdAt: '2026-01-01',
}

const RATE: ExchangeRate = {
  id: 'r1',
  fromCurrencyId: 'c1',
  toCurrencyId: 'c2',
  rate: 55.2,
  rateDate: '2026-06-29',
  source: 'BCV',
  createdAt: '2026-06-29T00:00:00Z',
}

const currencies = [USD, VES]

describe('RateCard', () => {
  it('renders currency pair and rate', () => {
    render(<RateCard rate={RATE} currencies={currencies} onEdit={vi.fn()} />)
    expect(screen.getByText(/USD/)).toBeInTheDocument()
    expect(screen.getByText(/VES/)).toBeInTheDocument()
    expect(screen.getByText(/55[.,]2/)).toBeInTheDocument()
  })

  it('renders source when present', () => {
    render(<RateCard rate={RATE} currencies={currencies} onEdit={vi.fn()} />)
    expect(screen.getByText(/BCV/i)).toBeInTheDocument()
  })

  it('renders rate date', () => {
    render(<RateCard rate={RATE} currencies={currencies} onEdit={vi.fn()} />)
    expect(screen.getByText(/2026-06-29/)).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn()
    render(<RateCard rate={RATE} currencies={currencies} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(RATE)
  })
})
