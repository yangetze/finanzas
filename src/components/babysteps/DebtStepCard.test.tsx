import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DebtStepCard } from './DebtStepCard'

const CURRENCIES = [
  { id: 'ves', symbol: 'Bs' },
  { id: 'usd', symbol: '$' },
]

describe('DebtStepCard', () => {
  it('shows the step title', () => {
    render(<DebtStepCard totals={[]} currencies={CURRENCIES} />)
    expect(screen.getByText(/paso 2/i)).toBeInTheDocument()
    expect(screen.getByText(/pagar toda la deuda/i)).toBeInTheDocument()
  })

  it('shows a completed state when there is no debt', () => {
    render(<DebtStepCard totals={[]} currencies={CURRENCIES} />)
    expect(screen.getByText(/sin deudas/i)).toBeInTheDocument()
  })

  it('lists debt per currency when in progress', () => {
    render(<DebtStepCard totals={[{ currencyId: 'ves', total: 450 }]} currencies={CURRENCIES} />)
    expect(screen.getByText(/Bs 450,00/)).toBeInTheDocument()
    expect(screen.queryByText(/sin deudas/i)).not.toBeInTheDocument()
  })

  it('lists multiple currencies separately', () => {
    render(
      <DebtStepCard
        totals={[
          { currencyId: 'ves', total: 450 },
          { currencyId: 'usd', total: 120 },
        ]}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/Bs 450,00/)).toBeInTheDocument()
    expect(screen.getByText(/\$ 120,00/)).toBeInTheDocument()
  })
})
