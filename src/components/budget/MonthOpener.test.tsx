import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonthOpener } from './MonthOpener'
import type { BudgetItem } from '@/types'

const ITEM: BudgetItem = {
  id: 'b1',
  userId: 'u1',
  envelopeId: 'e1',
  walletId: null,
  name: 'Netflix',
  baseAmount: 15,
  currencyId: 'c1',
  paymentCurrencyId: null,
  referenceRate: null,
  frequency: 'monthly', itemType: 'fixed',
  paymentDay: 10,
  startMonth: null,
  spendingType: 'flexible',
  isActive: true,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('MonthOpener', () => {
  it('renders Abrir mes button', () => {
    render(
      <MonthOpener
        items={[ITEM]}
        userId="u1"
        year={2026}
        month={6}
        baseCurrencyId="c1"
        onOpen={vi.fn()}
        loading={false}
      />,
    )
    expect(screen.getByRole('button', { name: /abrir mes/i })).toBeInTheDocument()
  })

  it('shows applicable item count', () => {
    render(
      <MonthOpener
        items={[ITEM]}
        userId="u1"
        year={2026}
        month={6}
        baseCurrencyId="c1"
        onOpen={vi.fn()}
        loading={false}
      />,
    )
    expect(screen.getByText(/1 partida/i)).toBeInTheDocument()
  })

  it('calls onOpen with generated transactions when confirmed', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <MonthOpener
        items={[ITEM]}
        userId="u1"
        year={2026}
        month={6}
        baseCurrencyId="c1"
        onOpen={onOpen}
        loading={false}
      />,
    )
    await user.click(screen.getByRole('button', { name: /abrir mes/i }))
    expect(onOpen).toHaveBeenCalledTimes(1)
    const txs = onOpen.mock.calls[0][0]
    expect(txs).toHaveLength(1)
    expect(txs[0].description).toBe('Netflix')
    expect(txs[0].date).toBe('2026-06-10')
  })

  it('shows zero count and disables button when no items apply', () => {
    const annualItem = { ...ITEM, frequency: 'annual' as const, startMonth: 1 }
    render(
      <MonthOpener
        items={[annualItem]}
        userId="u1"
        year={2026}
        month={6}
        baseCurrencyId="c1"
        onOpen={vi.fn()}
        loading={false}
      />,
    )
    expect(screen.getByRole('button', { name: /abrir mes/i })).toBeDisabled()
  })
})
