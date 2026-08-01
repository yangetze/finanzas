import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnvelopeForm } from './EnvelopeForm'
import type { Envelope } from '@/types'

const ENVELOPES: Envelope[] = [
  {
    id: 'e1', userId: 'u1', parentId: null, name: 'Hogar',
    spendCategory: 'supervivencia', isSavings: false, targetAmount: null, isEmergencyFund: false, emoji: '🏠', isActive: true, sortOrder: 1, notes: null,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
]

describe('EnvelopeForm', () => {
  it('renders name field', () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
  })

  it('shows parent selector for sub-envelope creation', () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/sobre padre/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct data when valid', async () => {
    const onSubmit = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Inter')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Inter' }),
    )
  })

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills when editing', () => {
    const initial = {
      name: 'Hogar',
      spendCategory: 'supervivencia' as const,
      parentId: null,
      emoji: '🏠',
      notes: null,
    }
    render(<EnvelopeForm envelopes={ENVELOPES} initialValues={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Hogar')
  })

  it('shows spend category selector', () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/categoría de gasto/i)).toBeInTheDocument()
  })

  it('includes spendCategory in submitted values', async () => {
    const onSubmit = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Ahorro')
    await userEvent.selectOptions(screen.getByLabelText(/categoría de gasto/i), 'crecimiento')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ spendCategory: 'crecimiento' }))
  })

  it('does not show the goal field until "Sobre de ahorro" is checked', () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText(/meta de ahorro/i)).not.toBeInTheDocument()
  })

  it('shows the goal field once "Sobre de ahorro" is checked', async () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByLabelText(/sobre de ahorro/i))
    expect(screen.getByLabelText(/meta de ahorro/i)).toBeInTheDocument()
  })

  it('submits targetAmount as a number when the goal field is filled', async () => {
    const onSubmit = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Viaje')
    await userEvent.click(screen.getByLabelText(/sobre de ahorro/i))
    await userEvent.type(screen.getByLabelText(/meta de ahorro/i), '1000')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ targetAmount: 1000 }))
  })

  it('submits targetAmount as null when the goal field is left empty', async () => {
    const onSubmit = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Viaje')
    await userEvent.click(screen.getByLabelText(/sobre de ahorro/i))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ targetAmount: null }))
  })

  it('pre-fills the goal field when editing a savings envelope', () => {
    const initial = {
      name: 'Viaje',
      spendCategory: null,
      isSavings: true,
      targetAmount: 1000,
      parentId: null,
      emoji: null,
      notes: null,
    }
    render(<EnvelopeForm envelopes={ENVELOPES} initialValues={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/meta de ahorro/i) as HTMLInputElement).value).toBe('1000')
  })

  it('does not show the emergency fund checkbox until "Sobre de ahorro" is checked', () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText(/fondo de emergencia/i)).not.toBeInTheDocument()
  })

  it('submits isEmergencyFund true when the checkbox is checked', async () => {
    const onSubmit = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Fondo Emergencia USD')
    await userEvent.click(screen.getByLabelText(/sobre de ahorro/i))
    await userEvent.click(screen.getByLabelText(/fondo de emergencia/i))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ isEmergencyFund: true }))
  })

  it('submits isEmergencyFund false by default', async () => {
    const onSubmit = vi.fn()
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Viaje')
    await userEvent.click(screen.getByLabelText(/sobre de ahorro/i))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ isEmergencyFund: false }))
  })

  it('pre-fills the emergency fund checkbox when editing', () => {
    const initial = {
      name: 'Fondo Emergencia USD',
      spendCategory: null,
      isSavings: true,
      isEmergencyFund: true,
      parentId: null,
      emoji: null,
      notes: null,
    }
    render(<EnvelopeForm envelopes={ENVELOPES} initialValues={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/fondo de emergencia/i) as HTMLInputElement).checked).toBe(true)
  })
})
