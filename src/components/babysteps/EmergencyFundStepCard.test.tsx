import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmergencyFundStepCard } from './EmergencyFundStepCard'

describe('EmergencyFundStepCard', () => {
  it('shows the step title', () => {
    render(<EmergencyFundStepCard result={{ total: 0, missingCurrencyIds: [] }} target={1000} currencies={[]} />)
    expect(screen.getByText(/paso 1/i)).toBeInTheDocument()
    expect(screen.getByText(/fondo de emergencia/i)).toBeInTheDocument()
  })

  it('shows progress toward the target when the total is known', () => {
    render(<EmergencyFundStepCard result={{ total: 340, missingCurrencyIds: [] }} target={1000} currencies={[]} />)
    expect(screen.getByText(/\$ 340,00 de \$ 1\.000,00/)).toBeInTheDocument()
  })

  it('shows a completed state once the target is reached', () => {
    render(<EmergencyFundStepCard result={{ total: 1200, missingCurrencyIds: [] }} target={1000} currencies={[]} />)
    expect(screen.getByText(/completado/i)).toBeInTheDocument()
  })

  it('shows an alert instead of a total when a rate is missing', () => {
    const currencies = [{ id: 'ves', code: 'VES' }]
    render(
      <EmergencyFundStepCard
        result={{ total: null, missingCurrencyIds: ['ves'] }}
        target={1000}
        currencies={currencies}
      />,
    )
    expect(screen.getByText(/falta.*tasa/i)).toBeInTheDocument()
    expect(screen.getByText(/VES/)).toBeInTheDocument()
  })
})
