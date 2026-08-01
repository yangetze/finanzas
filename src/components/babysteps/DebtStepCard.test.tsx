import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DebtStepCard } from './DebtStepCard'

const CURRENCIES = [
  { id: 'ves', symbol: 'Bs' },
  { id: 'usd', symbol: '$' },
]

function renderCard(totals: { currencyId: string; total: number }[]) {
  return render(
    <MemoryRouter>
      <DebtStepCard totals={totals} currencies={CURRENCIES} />
    </MemoryRouter>,
  )
}

describe('DebtStepCard', () => {
  it('shows the step title', () => {
    renderCard([])
    expect(screen.getByText(/paso 2/i)).toBeInTheDocument()
    expect(screen.getByText(/pagar toda la deuda/i)).toBeInTheDocument()
  })

  it('shows a completed state when there is no debt', () => {
    renderCard([])
    expect(screen.getByText(/sin deudas/i)).toBeInTheDocument()
  })

  it('lists debt per currency when in progress', () => {
    renderCard([{ currencyId: 'ves', total: 450 }])
    expect(screen.getByText(/Bs 450,00/)).toBeInTheDocument()
    expect(screen.queryByText(/sin deudas/i)).not.toBeInTheDocument()
  })

  it('lists multiple currencies separately', () => {
    renderCard([
      { currencyId: 'ves', total: 450 },
      { currencyId: 'usd', total: 120 },
    ])
    expect(screen.getByText(/Bs 450,00/)).toBeInTheDocument()
    expect(screen.getByText(/\$ 120,00/)).toBeInTheDocument()
  })

  it('does not name specific debt sources, since debts can be anything', () => {
    renderCard([{ currencyId: 'ves', total: 450 }])
    expect(screen.queryByText(/TDC/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Cashea/)).not.toBeInTheDocument()
  })

  it('links to the Deudas page to see what is being summed', () => {
    renderCard([{ currencyId: 'ves', total: 450 }])
    const link = screen.getByRole('link', { name: /ver detalle/i })
    expect(link).toHaveAttribute('href', '/deudas')
  })

  it('links to Deudas even in the debt-free state', () => {
    renderCard([])
    const link = screen.getByRole('link', { name: /ver detalle/i })
    expect(link).toHaveAttribute('href', '/deudas')
  })
})
