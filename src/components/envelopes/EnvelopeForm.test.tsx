import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnvelopeForm } from './EnvelopeForm'
import type { Envelope } from '@/types'

const ENVELOPES: Envelope[] = [
  {
    id: 'e1', userId: 'u1', parentId: null, name: 'Hogar', category: 'Hogar',
    priority: 'critico', emoji: '🏠', isActive: true, sortOrder: 1, notes: null,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
]

describe('EnvelopeForm', () => {
  it('renders name and priority fields', () => {
    render(<EnvelopeForm envelopes={ENVELOPES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
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
      expect.objectContaining({ name: 'Inter', priority: 'critico' }),
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
      category: 'Hogar',
      priority: 'critico' as const,
      parentId: null,
      emoji: '🏠',
      notes: null,
    }
    render(<EnvelopeForm envelopes={ENVELOPES} initialValues={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Hogar')
  })
})
