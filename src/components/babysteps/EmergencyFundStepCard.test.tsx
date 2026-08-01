import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmergencyFundStepCard } from './EmergencyFundStepCard'

describe('EmergencyFundStepCard', () => {
  it('shows the step title', () => {
    render(
      <EmergencyFundStepCard
        result={{ total: 0, missingCurrencyIds: [] }}
        target={1000}
        currencies={[]}
        onSaveTarget={vi.fn()}
      />,
    )
    expect(screen.getByText(/paso 1/i)).toBeInTheDocument()
    expect(screen.getByText(/fondo de emergencia/i)).toBeInTheDocument()
  })

  it('shows progress toward the target when the total is known', () => {
    render(
      <EmergencyFundStepCard
        result={{ total: 340, missingCurrencyIds: [] }}
        target={1000}
        currencies={[]}
        onSaveTarget={vi.fn()}
      />,
    )
    expect(screen.getByText(/\$ 340,00 de \$ 1\.000,00/)).toBeInTheDocument()
  })

  it('shows a completed state once the target is reached', () => {
    render(
      <EmergencyFundStepCard
        result={{ total: 1200, missingCurrencyIds: [] }}
        target={1000}
        currencies={[]}
        onSaveTarget={vi.fn()}
      />,
    )
    expect(screen.getByText(/completado/i)).toBeInTheDocument()
  })

  it('shows an alert instead of a total when a rate is missing', () => {
    const currencies = [{ id: 'ves', code: 'VES' }]
    render(
      <EmergencyFundStepCard
        result={{ total: null, missingCurrencyIds: ['ves'] }}
        target={1000}
        currencies={currencies}
        onSaveTarget={vi.fn()}
      />,
    )
    expect(screen.getByText(/falta.*tasa/i)).toBeInTheDocument()
    expect(screen.getByText(/VES/)).toBeInTheDocument()
  })

  it('does not show a target input until the edit button is clicked', () => {
    render(
      <EmergencyFundStepCard
        result={{ total: 340, missingCurrencyIds: [] }}
        target={1000}
        currencies={[]}
        onSaveTarget={vi.fn()}
      />,
    )
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('lets the user edit and save a new target', async () => {
    const onSaveTarget = vi.fn()
    render(
      <EmergencyFundStepCard
        result={{ total: 340, missingCurrencyIds: [] }}
        target={1000}
        currencies={[]}
        onSaveTarget={onSaveTarget}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /editar meta/i }))
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '2000')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSaveTarget).toHaveBeenCalledWith(2000)
  })

  it('closes the edit input on cancel without saving', async () => {
    const onSaveTarget = vi.fn()
    render(
      <EmergencyFundStepCard
        result={{ total: 340, missingCurrencyIds: [] }}
        target={1000}
        currencies={[]}
        onSaveTarget={onSaveTarget}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /editar meta/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(onSaveTarget).not.toHaveBeenCalled()
  })
})
