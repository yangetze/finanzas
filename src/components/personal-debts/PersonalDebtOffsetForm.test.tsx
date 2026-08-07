import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalDebtOffsetForm } from './PersonalDebtOffsetForm'
import type { Currency, PersonalDebt } from '@/types'

const CURRENCIES: Currency[] = [
  { id: 'usd', code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', isActive: true, sortOrder: 1, createdAt: '2026-01-01' },
]

const debt = (overrides: Partial<PersonalDebt> = {}): PersonalDebt => ({
  id: 'd1',
  userId: 'u1',
  debtorId: 'debtor1',
  direction: 'they_owe_me',
  description: 'Uber',
  currencyId: 'usd',
  originalAmount: 4,
  date: '2026-08-01',
  status: 'open',
  isIndexed: false,
  indexCurrencyId: null,
  notes: null,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
  ...overrides,
})

// Guiding example: debt B ($5 i_owe_them, "Cena") vs debt A ($4 they_owe_me, "Uber")
const THEY_OWE_ME = [{ ...debt({ id: 'debt-b', description: 'Uber' }), outstanding: 4 }]
const I_OWE_THEM = [
  { ...debt({ id: 'debt-a', direction: 'i_owe_them', description: 'Cena', originalAmount: 5 }), outstanding: 5 },
]

describe('PersonalDebtOffsetForm', () => {
  it('renders selects for both directions', () => {
    render(
      <PersonalDebtOffsetForm
        theyOweMeDebts={THEY_OWE_ME}
        iOweThemDebts={I_OWE_THEM}
        currencies={CURRENCIES}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/deuda que me deben/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/deuda que le debo/i)).toBeInTheDocument()
  })

  it('shows the offset preview from the guiding example once both debts are selected', async () => {
    render(
      <PersonalDebtOffsetForm
        theyOweMeDebts={THEY_OWE_ME}
        iOweThemDebts={I_OWE_THEM}
        currencies={CURRENCIES}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/deuda que me deben/i), 'debt-b')
    await userEvent.selectOptions(screen.getByLabelText(/deuda que le debo/i), 'debt-a')

    expect(screen.getByText(/compensación/i)).toBeInTheDocument()
    expect(screen.getByText('$4,00 USD')).toBeInTheDocument()
  })

  it('shows validation error when no debts selected', async () => {
    render(
      <PersonalDebtOffsetForm
        theyOweMeDebts={THEY_OWE_ME}
        iOweThemDebts={I_OWE_THEM}
        currencies={CURRENCIES}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /compensar/i }))
    expect(screen.getByText(/seleccione una deuda de cada lado/i)).toBeInTheDocument()
  })

  it('calls onSubmit with the offset amount from the guiding example', async () => {
    const onSubmit = vi.fn()
    render(
      <PersonalDebtOffsetForm
        theyOweMeDebts={THEY_OWE_ME}
        iOweThemDebts={I_OWE_THEM}
        currencies={CURRENCIES}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/deuda que me deben/i), 'debt-b')
    await userEvent.selectOptions(screen.getByLabelText(/deuda que le debo/i), 'debt-a')
    await userEvent.click(screen.getByRole('button', { name: /compensar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        theyOweMeDebtId: 'debt-b',
        iOweThemDebtId: 'debt-a',
        amount: 4,
        currencyId: 'usd',
      }),
    )
  })

  it('shows a currency mismatch error and blocks submit', async () => {
    const mismatchedIOweThem = [{ ...debt({ id: 'debt-c', direction: 'i_owe_them', currencyId: 've' }), outstanding: 5 }]
    const currencies = [...CURRENCIES, { id: 've', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat' as const, isActive: true, sortOrder: 2, createdAt: '2026-01-01' }]
    const onSubmit = vi.fn()
    render(
      <PersonalDebtOffsetForm
        theyOweMeDebts={THEY_OWE_ME}
        iOweThemDebts={mismatchedIOweThem}
        currencies={currencies}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/deuda que me deben/i), 'debt-b')
    await userEvent.selectOptions(screen.getByLabelText(/deuda que le debo/i), 'debt-c')

    expect(screen.getByText(/misma moneda/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /compensar/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
