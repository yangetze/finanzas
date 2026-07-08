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
  spendCategory: 'supervivencia', isSavings: false,
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

  it('renders spend category badge', () => {
    render(<EnvelopeCard envelope={GROUP} subCount={0} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.getByText(/supervivencia/i)).toBeInTheDocument()
  })

  it('does not render badge when spendCategory is null', () => {
    const noCategory = { ...GROUP, spendCategory: null as null }
    render(<EnvelopeCard envelope={noCategory} subCount={0} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.queryByText(/supervivencia|flexible|crecimiento/i)).not.toBeInTheDocument()
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

describe('EnvelopeCard — budget stats', () => {
  it('shows disponible against the monthly budget', () => {
    render(
      <EnvelopeCard
        envelope={SUB}
        subCount={0}
        stats={{ kind: 'monthly', available: 120, budget: 300, symbol: '$' }}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
      />,
    )
    expect(screen.getByText(/disponible/i)).toBeInTheDocument()
    expect(screen.getByText(/\$ 120,00 de \$ 300,00/)).toBeInTheDocument()
  })

  it('shows negative disponible in coral', () => {
    render(
      <EnvelopeCard
        envelope={SUB}
        subCount={0}
        stats={{ kind: 'monthly', available: -50, budget: 300, symbol: '$' }}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
      />,
    )
    expect(screen.getByText(/-\$ 50,00 de \$ 300,00/)).toBeInTheDocument()
  })

  it('shows acumulado for savings envelopes', () => {
    render(
      <EnvelopeCard
        envelope={{ ...SUB, isSavings: true }}
        subCount={0}
        stats={{ kind: 'savings', accumulated: 1250, monthAllocated: 100, symbol: '$' }}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
      />,
    )
    expect(screen.getByText(/acumulado/i)).toBeInTheDocument()
    expect(screen.getByText(/\$ 1\.250,00/)).toBeInTheDocument()
    expect(screen.getByText(/\+\$ 100,00 este mes/)).toBeInTheDocument()
  })

  it('renders no stats block when stats are absent', () => {
    render(<EnvelopeCard envelope={SUB} subCount={0} onEdit={vi.fn()} onDeactivate={vi.fn()} />)
    expect(screen.queryByText(/disponible/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/acumulado/i)).not.toBeInTheDocument()
  })
})
