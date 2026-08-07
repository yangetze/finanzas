import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }))

vi.mock('@/hooks/useAuth', () => ({ useAuth: mockUseAuth }))

import { AdminRoute } from './AdminRoute'

function renderWithRouter(initialEntry = '/tasas') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route
          path="/tasas"
          element={
            <AdminRoute>
              <div>Admin Content</div>
            </AdminRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  it('redirects to /dashboard when user is not admin', () => {
    mockUseAuth.mockReturnValue({ user: { isAdmin: false }, loading: false })
    renderWithRouter()
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user is not loaded yet and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    renderWithRouter()
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('renders children when user is admin', () => {
    mockUseAuth.mockReturnValue({ user: { isAdmin: true }, loading: false })
    renderWithRouter()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('shows a spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    const { container } = renderWithRouter()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
