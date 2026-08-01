import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvestmentStepCard } from './InvestmentStepCard'

const CURRENCIES = [{ id: 'ves', code: 'VES' }]
const NO_MISSING = { missingCurrencyIds: [] }

describe('InvestmentStepCard', () => {
  it('shows the step title', () => {
    render(
      <InvestmentStepCard
        income={{ total: 2000, ...NO_MISSING }}
        investment={{ total: 200, ...NO_MISSING }}
        hasIncomeHistory
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/paso 4/i)).toBeInTheDocument()
    expect(screen.getByText(/invertir el 15%/i)).toBeInTheDocument()
  })

  it('shows the computed percentage', () => {
    render(
      <InvestmentStepCard
        income={{ total: 2000, ...NO_MISSING }}
        investment={{ total: 200, ...NO_MISSING }}
        hasIncomeHistory
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/10([.,]0)?%/)).toBeInTheDocument()
  })

  it('shows a completed badge once 15% is reached', () => {
    render(
      <InvestmentStepCard
        income={{ total: 2000, ...NO_MISSING }}
        investment={{ total: 300, ...NO_MISSING }}
        hasIncomeHistory
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/completado/i)).toBeInTheDocument()
  })

  it('shows a no-income state when there is no income history', () => {
    render(
      <InvestmentStepCard
        income={{ total: 0, ...NO_MISSING }}
        investment={{ total: 0, ...NO_MISSING }}
        hasIncomeHistory={false}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/sin ingresos registrados/i)).toBeInTheDocument()
  })

  it('shows an alert when a rate is missing for income or investment', () => {
    render(
      <InvestmentStepCard
        income={{ total: null, missingCurrencyIds: ['ves'] }}
        investment={{ total: 200, ...NO_MISSING }}
        hasIncomeHistory
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/falta.*tasa/i)).toBeInTheDocument()
    expect(screen.getByText(/VES/)).toBeInTheDocument()
  })
})
