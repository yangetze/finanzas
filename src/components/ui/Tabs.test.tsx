import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Tabs'

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'tasas', label: 'Tasas' },
]

describe('Tabs', () => {
  it('renders all tab labels', () => {
    render(<Tabs tabs={tabs} activeTab="general" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tasas' })).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<Tabs tabs={tabs} activeTab="tasas" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Tasas' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange with the tab id when clicked', async () => {
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} activeTab="general" onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Tasas' }))
    expect(onChange).toHaveBeenCalledWith('tasas')
  })
})
