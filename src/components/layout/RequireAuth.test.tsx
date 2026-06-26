import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }))

vi.mock('@/hooks/useAuth', () => ({ useAuth: mockUseAuth }))

import { RequireAuth } from './RequireAuth'

function renderWithRouter(initialEntry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Protected Content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('redirects to /login when no session', () => {
    mockUseAuth.mockReturnValue({ session: null, user: null, loading: false })
    renderWithRouter()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects to /onboarding when session exists but onboarding_done is false', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      user: { onboardingDone: false },
      loading: false,
    })
    renderWithRouter()
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument()
  })

  it('renders children when session exists and onboarding_done is true', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      user: { onboardingDone: true },
      loading: false,
    })
    renderWithRouter()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
