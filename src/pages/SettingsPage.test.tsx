import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const {
  mockShowToast,
  mockUpdateUserProfile,
  mockGetCurrencies,
  mockSignOut,
  mockUseAuth,
  mockGetExchangeRates,
  mockUpsertExchangeRate,
} = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
  mockGetCurrencies: vi.fn(),
  mockSignOut: vi.fn(),
  mockUseAuth: vi.fn(),
  mockGetExchangeRates: vi.fn(),
  mockUpsertExchangeRate: vi.fn(),
}))

vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ showToast: mockShowToast }) }))
vi.mock('@/lib/supabase', () => ({
  getCurrencies: mockGetCurrencies,
  updateUserProfile: mockUpdateUserProfile,
  signOut: mockSignOut,
  getExchangeRates: mockGetExchangeRates,
  upsertExchangeRate: mockUpsertExchangeRate,
}))
vi.mock('@/hooks/useAuth', () => ({ useAuth: mockUseAuth }))

const baseUser = {
  id: 'user-123',
  email: 'test@test.com',
  name: 'Juan',
  baseCurrencyId: 'c1',
  multiCurrency: false,
  onboardingDone: true,
  isAdmin: false,
}

import { SettingsPage } from './SettingsPage'

function renderSettings() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: baseUser, loading: false })
    mockGetCurrencies.mockResolvedValue([
      { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', sort_order: 1 },
    ])
    mockUpdateUserProfile.mockResolvedValue({ error: null })
    mockGetExchangeRates.mockResolvedValue([])
  })

  it('loads and displays current user name and email', async () => {
    renderSettings()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument()
    })
  })

  it('saving calls updateUserProfile with updated name', async () => {
    renderSettings()

    await waitFor(() => screen.getByDisplayValue('Juan'))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Carlos' } })

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', expect.objectContaining({
        name: 'Carlos',
      }))
    })
  })

  it('shows success toast on save', async () => {
    renderSettings()

    await waitFor(() => screen.getByDisplayValue('Juan'))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Cambios guardados correctamente')
    })
  })

  it('does not show a Tasas tab for non-admin users', async () => {
    renderSettings()
    await waitFor(() => screen.getByDisplayValue('Juan'))
    expect(screen.queryByRole('tab', { name: 'Tasas' })).not.toBeInTheDocument()
  })

  it('shows a Tasas tab for admin users and switches to it on click', async () => {
    mockUseAuth.mockReturnValue({ user: { ...baseUser, isAdmin: true }, loading: false })
    renderSettings()

    await waitFor(() => screen.getByDisplayValue('Juan'))
    const tasasTab = screen.getByRole('tab', { name: 'Tasas' })
    await userEvent.click(tasasTab)

    await waitFor(() => {
      expect(screen.getByText('Tasas de cambio')).toBeInTheDocument()
    })
    expect(screen.queryByDisplayValue('Juan')).not.toBeInTheDocument()
  })
})
