import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DebtorCard } from './DebtorCard'
import type { Debtor, PersonalDebt, Currency } from '@/types'

const CURRENCY: Currency = {
  id: 'c1',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  type: 'fiat',
  isActive: true,
  sortOrder: 1,
  createdAt: '2026-01-01',
}

const USDC: Currency = {
  id: 'usdc',
  code: 'USDC',
  name: 'USD Coin',
  symbol: '$',
  type: 'stable',
  isActive: true,
  sortOrder: 0,
  createdAt: '2026-01-01',
}

const CURRENCIES = [CURRENCY, USDC]

const DEBTOR: Debtor = {
  id: 'd1',
  userId: 'u1',
  name: 'María',
  notes: null,
  isActive: true,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
}

const DEBT: PersonalDebt = {
  id: 'pd1',
  userId: 'u1',
  debtorId: 'd1',
  direction: 'i_owe_them',
  description: 'Cena del viernes',
  currencyId: 'c1',
  originalAmount: 5,
  date: '2026-08-01',
  status: 'open',
  isIndexed: false,
  notes: null,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
}

const noop = {
  onEdit: vi.fn(),
  onDeactivate: vi.fn(),
  onAddDebt: vi.fn(),
  onOffset: vi.fn(),
  onAddPayment: vi.fn(),
  onDeleteDebt: vi.fn(),
  onDeletePayment: vi.fn(),
}

describe('DebtorCard', () => {
  it('renders debtor name', () => {
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.getByText('María')).toBeInTheDocument()
  })

  it('shows "sin saldo pendiente" when netTotals is empty', () => {
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.getByText(/sin saldo pendiente/i)).toBeInTheDocument()
  })

  it('shows "me debe" in sage for a positive net and "le debo" for a negative net', () => {
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[{ currencyId: 'c1', total: 4 }]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.getByText(/me debe \$4,00/i)).toBeInTheDocument()
  })

  it('shows "le debo" for a negative net', () => {
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[{ currencyId: 'c1', total: -1 }]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.getByText(/le debo \$1,00/i)).toBeInTheDocument()
  })

  it('shows the original currency when no rate exists to convert it to USDC', () => {
    const ves: Currency = { ...CURRENCY, id: 'ves', code: 'VES', symbol: 'Bs.', type: 'fiat' }
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[{ currencyId: 'ves', total: 400 }]}
        currencies={[...CURRENCIES, ves]}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.getByText(/me debe bs\.400,00 ves/i)).toBeInTheDocument()
  })

  it('converts a fiat total to USDC when a rate exists', () => {
    const ves: Currency = { ...CURRENCY, id: 'ves', code: 'VES', symbol: 'Bs.', type: 'fiat' }
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[{ currencyId: 'ves', total: 400 }]}
        currencies={[...CURRENCIES, ves]}
        rates={[{ fromCurrencyId: 'usdc', toCurrencyId: 'ves', rate: 200, rateDate: '2026-08-06' }]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.getByText(/me debe \$2,00 usdc/i)).toBeInTheDocument()
  })

  it('hides debts until expanded', async () => {
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[DEBT]}
        payments={[]}
        netTotals={[{ currencyId: 'c1', total: -5 }]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.queryByText('Cena del viernes')).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(/expandir/i))
    expect(screen.getByText('Cena del viernes')).toBeInTheDocument()
  })

  it('calls onAddDebt when the add debt button is clicked', async () => {
    const onAddDebt = vi.fn()
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
        onAddDebt={onAddDebt}
      />,
    )
    await userEvent.click(screen.getByLabelText(/agregar deuda/i))
    expect(onAddDebt).toHaveBeenCalledWith(DEBTOR)
  })

  it('hides the offset button when the debtor has no crossed debts', () => {
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[DEBT]}
        payments={[]}
        netTotals={[{ currencyId: 'c1', total: -5 }]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
      />,
    )
    expect(screen.queryByLabelText(/compensar/i)).not.toBeInTheDocument()
  })

  it('shows the offset button and calls onOffset when the debtor has crossed debts', async () => {
    const theyOweMeDebt: PersonalDebt = { ...DEBT, id: 'pd2', direction: 'they_owe_me' }
    const onOffset = vi.fn()
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[DEBT, theyOweMeDebt]}
        payments={[]}
        netTotals={[{ currencyId: 'c1', total: -1 }]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
        onOffset={onOffset}
      />,
    )
    await userEvent.click(screen.getByLabelText(/compensar/i))
    expect(onOffset).toHaveBeenCalledWith(DEBTOR)
  })

  it('calls onDeactivate with debtor id', async () => {
    const onDeactivate = vi.fn()
    render(
      <DebtorCard
        debtor={DEBTOR}
        debts={[]}
        payments={[]}
        netTotals={[]}
        currencies={CURRENCIES}
        rates={[]}
        wallets={[]}
        {...noop}
        onDeactivate={onDeactivate}
      />,
    )
    await userEvent.click(screen.getByLabelText(/desactivar/i))
    expect(onDeactivate).toHaveBeenCalledWith('d1')
  })
})
