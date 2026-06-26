import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const { mockSignOut } = vi.hoisted(() => ({ mockSignOut: vi.fn() }))

vi.mock('@/lib/supabase', () => ({ signOut: mockSignOut }))

import { AppShell } from './AppShell'

function renderAppShell(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppShell />
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders the brand name', () => {
    renderAppShell()
    expect(screen.getAllByText('sobres.').length).toBeGreaterThan(0)
  })

  it('renders navigation items', () => {
    renderAppShell()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sobres').length).toBeGreaterThan(0)
  })

  it('calls signOut when sign out button is clicked', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    renderAppShell()
    const signOutBtn = screen.getByRole('button', { name: /cerrar sesión/i })
    await userEvent.click(signOutBtn)
    expect(mockSignOut).toHaveBeenCalled()
  })
})
