import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { mockGetCurrencies, mockSignInWithMagicLink } = vi.hoisted(() => ({
  mockGetCurrencies: vi.fn(),
  mockSignInWithMagicLink: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getCurrencies: mockGetCurrencies,
  signInWithMagicLink: mockSignInWithMagicLink,
}))

import { RegisterPage } from './RegisterPage'

const mockCurrencies = [
  { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', sort_order: 1 },
  { id: 'c2', code: 'VES', name: 'Bolívar venezolano', symbol: 'Bs.', type: 'fiat', sort_order: 5 },
]

function renderRegister() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockGetCurrencies.mockResolvedValue(mockCurrencies)
    mockSignInWithMagicLink.mockResolvedValue({ error: null })
  })

  it('renders form with name, currency, and email fields', async () => {
    renderRegister()
    expect(screen.getByPlaceholderText(/tu nombre/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tu@correo\.com/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText(/moneda principal/i)).toBeInTheDocument()
    })
  })

  it('submit button is disabled until email and currency are filled', async () => {
    renderRegister()
    const submitBtn = screen.getByRole('button', { name: /crear cuenta/i })
    expect(submitBtn).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText(/tu@correo\.com/i), 'user@test.com')
    expect(submitBtn).toBeDisabled()

    await waitFor(() => screen.getByLabelText(/moneda principal/i))
    await userEvent.selectOptions(screen.getByLabelText(/moneda principal/i), 'c1')

    expect(submitBtn).not.toBeDisabled()
  })

  it('saves signup data to localStorage and sends magic link on submit', async () => {
    renderRegister()

    await userEvent.type(screen.getByPlaceholderText(/tu nombre/i), 'Ana')
    await waitFor(() => {
      const sel = screen.getByLabelText(/moneda principal/i)
      expect(sel.querySelectorAll('option').length).toBeGreaterThan(1)
    })
    await userEvent.selectOptions(screen.getByLabelText(/moneda principal/i), 'c1')
    await userEvent.type(screen.getByPlaceholderText(/tu@correo\.com/i), 'ana@test.com')

    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('ana@test.com')
      const stored = JSON.parse(localStorage.getItem('sobres_signup_data') ?? 'null')
      expect(stored).toEqual({ name: 'Ana', baseCurrencyId: 'c1' })
    })
  })

  it('shows confirmation screen after successful magic link send', async () => {
    renderRegister()

    await waitFor(() => {
      const sel = screen.getByLabelText(/moneda principal/i)
      expect(sel.querySelectorAll('option').length).toBeGreaterThan(1)
    })
    await userEvent.selectOptions(screen.getByLabelText(/moneda principal/i), 'c1')
    await userEvent.type(screen.getByPlaceholderText(/tu@correo\.com/i), 'user@test.com')

    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText('Revisa tu correo')).toBeInTheDocument()
    })
  })

  it('renders link back to login page', () => {
    renderRegister()
    const link = screen.getByRole('link', { name: /acceder/i })
    expect(link).toHaveAttribute('href', '/login')
  })
})
