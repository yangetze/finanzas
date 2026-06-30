import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { mockNavigate, mockUpdateUserProfile, mockGetCurrencies } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
  mockGetCurrencies: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/lib/supabase', () => ({
  getCurrencies: mockGetCurrencies,
  updateUserProfile: mockUpdateUserProfile,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123', name: null }, loading: false, refreshUser: vi.fn().mockResolvedValue(undefined) }),
}))

import { OnboardingPage } from './OnboardingPage'

const mockCurrencies = [
  { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', sort_order: 1 },
  { id: 'c2', code: 'VES', name: 'Bolívar venezolano', symbol: 'Bs.', type: 'fiat', sort_order: 5 },
]

function renderOnboarding() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrencies.mockResolvedValue(mockCurrencies)
    mockUpdateUserProfile.mockResolvedValue({ error: null })
  })

  it('shows Step 1 (name) on load', () => {
    renderOnboarding()
    expect(screen.getByText('¿Cómo quieres que te llamemos?')).toBeInTheDocument()
  })

  it('proceeds to step 2 and requires currency selection', async () => {
    renderOnboarding()

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByText('¿Cuál es tu moneda principal?')).toBeInTheDocument()

    const nextBtn = screen.getByRole('button', { name: /siguiente/i })
    expect(nextBtn).toBeDisabled()
  })

  it('on final submit calls updateUserProfile with correct data', async () => {
    renderOnboarding()

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    await waitFor(() => screen.getByLabelText('Moneda principal'))
    await userEvent.selectOptions(screen.getByLabelText('Moneda principal'), 'c1')

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await userEvent.click(screen.getByRole('button', { name: /empezar/i }))

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', {
        name: undefined,
        baseCurrencyId: 'c1',
        multiCurrency: false,
        onboardingDone: true,
      })
    })
  })

  it('redirects to /dashboard on success', async () => {
    renderOnboarding()

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    await waitFor(() => screen.getByLabelText('Moneda principal'))
    await userEvent.selectOptions(screen.getByLabelText('Moneda principal'), 'c1')

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await userEvent.click(screen.getByRole('button', { name: /empezar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })
})
