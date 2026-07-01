import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnvelopeCard } from './EnvelopeCard'
import type { Envelope } from '@/types'

const GROUP: Envelope = {
  id: 'e1',
  userId: 'u1',
  parentId: null,
  name: 'Hogar',
  category: 'Hogar',
  priority: 'critico',
  spendCategory: null,
  emoji: '🏠',
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const SUB: Envelope = {
  ...GROUP,
  id: 'e2',
  parentId: 'e1',
  name: 'Inter',
  emoji: null,
}

describe('EnvelopeCard', () => {
  it('renders envelope name and emoji', () => {
    render(<EnvelopeCard envelope={GROUP} subCount={3} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText('Hogar')).toBeInTheDocument()
    expect(screen.getByText('🏠')).toBeInTheDocument()
  })

  it('renders priority badge', () => {
    render(<EnvelopeCard envelope={GROUP} subCount={0} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText(/crítico/i)).toBeInTheDocument()
  })

  it('shows sub-envelope count for group envelopes', () => {
    render(<EnvelopeCard envelope={GROUP} subCount={5} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn()
    render(<EnvelopeCard envelope={GROUP} subCount={0} onEdit={onEdit} onDeactivate={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(GROUP)
  })

  it('calls onDeactivate with id', async () => {
    const onDeactivate = vi.fn()
    render(<EnvelopeCard envelope={GROUP} subCount={0} onEdit={vi.fn()} onDeactivate={onDeactivate} />)
    await userEvent.click(screen.getByRole('button', { name: /desactivar/i }))
    expect(onDeactivate).toHaveBeenCalledWith('e1')
  })

  it('renders sub-envelope without subCount display', () => {
    render(<EnvelopeCard envelope={SUB} subCount={0} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText('Inter')).toBeInTheDocument()
  })
})
