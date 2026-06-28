import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const { mockSignInWithMagicLink, mockSignInAsDemo } = vi.hoisted(() => ({
  mockSignInWithMagicLink: vi.fn(),
  mockSignInAsDemo: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  signInWithMagicLink: mockSignInWithMagicLink,
}))

vi.mock('@/lib/demo', () => ({
  signInAsDemo: mockSignInAsDemo,
  DEMO_PENDING_KEY: 'sobres_demo_pending',
}))

import { LoginPage } from './LoginPage'

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders magic link form with email input', () => {
    renderLogin()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recibir enlace/i })).toBeInTheDocument()
  })

  it('shows confirmation after successful magic link send', async () => {
    mockSignInWithMagicLink.mockResolvedValue({ error: null })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /recibir enlace/i }))

    await waitFor(() => {
      expect(screen.getByText('Revisa tu correo')).toBeInTheDocument()
    })
  })

  it('shows rate limit message on 429 magic link error', async () => {
    const rateLimitError = Object.assign(new Error('Email rate limit exceeded'), { status: 429 })
    mockSignInWithMagicLink.mockResolvedValue({ error: rateLimitError })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /recibir enlace/i }))

    await waitFor(() => {
      expect(screen.getByText(/demasiados intentos/i)).toBeInTheDocument()
    })
  })

  it('shows error message on generic magic link failure', async () => {
    const authError = Object.assign(new Error('Network error'), { status: 500 })
    mockSignInWithMagicLink.mockResolvedValue({ error: authError })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /recibir enlace/i }))

    await waitFor(() => {
      expect(screen.getByText(/no pudimos enviar el enlace/i)).toBeInTheDocument()
    })
  })

  it('renders "Ver demo" button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /ver demo/i })).toBeInTheDocument()
  })

  it('calls signInAsDemo when demo button is clicked', async () => {
    mockSignInAsDemo.mockResolvedValue({ error: null })
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: /ver demo/i }))

    await waitFor(() => {
      expect(mockSignInAsDemo).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error when demo login fails', async () => {
    mockSignInAsDemo.mockResolvedValue({ error: new Error('Auth failed') })
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: /ver demo/i }))

    await waitFor(() => {
      expect(screen.getByText(/no se pudo acceder al demo/i)).toBeInTheDocument()
    })
  })

  it('renders "Crear cuenta" link pointing to /register', () => {
    renderLogin()
    const link = screen.getByRole('link', { name: /crear cuenta/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/register')
  })
})
