import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { mockShowToast, mockUpdateUserProfile, mockGetCurrencies, mockSignOut } = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
  mockGetCurrencies: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ showToast: mockShowToast }) }))
vi.mock('@/lib/supabase', () => ({
  getCurrencies: mockGetCurrencies,
  updateUserProfile: mockUpdateUserProfile,
  signOut: mockSignOut,
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      email: 'test@test.com',
      name: 'Juan',
      baseCurrencyId: 'c1',
      multiCurrency: false,
      onboardingDone: true,
    },
    loading: false,
  }),
}))

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
    mockGetCurrencies.mockResolvedValue([
      { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', sort_order: 1 },
    ])
    mockUpdateUserProfile.mockResolvedValue({ error: null })
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
})
