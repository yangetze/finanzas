import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FullEmergencyFundStepCard } from './FullEmergencyFundStepCard'

const CURRENCIES = [{ id: 'ves', code: 'VES' }]
const NO_MISSING = { missingCurrencyIds: [] }

describe('FullEmergencyFundStepCard', () => {
  it('shows the step title', () => {
    render(
      <FullEmergencyFundStepCard
        fund={{ total: 0, ...NO_MISSING }}
        expenses={{ total: 500, ...NO_MISSING }}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/paso 3/i)).toBeInTheDocument()
    expect(screen.getByText(/3.*6 meses/i)).toBeInTheDocument()
  })

  it('shows the 3-month and 6-month targets derived from monthly expenses', () => {
    render(
      <FullEmergencyFundStepCard
        fund={{ total: 600, ...NO_MISSING }}
        expenses={{ total: 500, ...NO_MISSING }}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/\$ 600,00/)).toBeInTheDocument()
    expect(screen.getByText(/\$ 1\.500,00/)).toBeInTheDocument()
    expect(screen.getByText(/\$ 3\.000,00/)).toBeInTheDocument()
  })

  it('shows a minimum-reached badge once the 3-month target is hit', () => {
    render(
      <FullEmergencyFundStepCard
        fund={{ total: 1600, ...NO_MISSING }}
        expenses={{ total: 500, ...NO_MISSING }}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/mínimo alcanzado/i)).toBeInTheDocument()
  })

  it('shows an ideal-reached badge once the 6-month target is hit', () => {
    render(
      <FullEmergencyFundStepCard
        fund={{ total: 3200, ...NO_MISSING }}
        expenses={{ total: 500, ...NO_MISSING }}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/completado/i)).toBeInTheDocument()
  })

  it('shows an alert instead of targets when monthly expenses cannot be consolidated', () => {
    render(
      <FullEmergencyFundStepCard
        fund={{ total: 600, ...NO_MISSING }}
        expenses={{ total: null, missingCurrencyIds: ['ves'] }}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/falta.*tasa/i)).toBeInTheDocument()
    expect(screen.getByText(/VES/)).toBeInTheDocument()
  })

  it('shows an alert instead of targets when the fund total cannot be consolidated', () => {
    render(
      <FullEmergencyFundStepCard
        fund={{ total: null, missingCurrencyIds: ['ves'] }}
        expenses={{ total: 500, ...NO_MISSING }}
        currencies={CURRENCIES}
      />,
    )
    expect(screen.getByText(/falta.*tasa/i)).toBeInTheDocument()
    expect(screen.getByText(/VES/)).toBeInTheDocument()
  })
})
