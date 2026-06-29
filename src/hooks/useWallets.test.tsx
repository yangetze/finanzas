import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetWallets, mockCreateWallet, mockUpdateWallet, mockDeactivateWallet } = vi.hoisted(
  () => ({
    mockGetWallets: vi.fn(),
    mockCreateWallet: vi.fn(),
    mockUpdateWallet: vi.fn(),
    mockDeactivateWallet: vi.fn(),
  }),
)

vi.mock('@/lib/supabase', () => ({
  getWallets: mockGetWallets,
  createWallet: mockCreateWallet,
  updateWallet: mockUpdateWallet,
  deactivateWallet: mockDeactivateWallet,
}))

import { useWallets, useCreateWallet, useDeactivateWallet } from './useWallets'

const MOCK_WALLET_ROW = {
  id: 'w1',
  user_id: 'u1',
  name: 'Binance',
  currency_id: 'c1',
  type: 'asset',
  credit_limit: null,
  balance: 150,
  is_active: true,
  sort_order: 1,
  notes: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

const MOCK_WALLET = {
  id: 'w1',
  userId: 'u1',
  name: 'Binance',
  currencyId: 'c1',
  type: 'asset',
  creditLimit: null,
  balance: 150,
  isActive: true,
  sortOrder: 1,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useWallets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns wallet list after fetch', async () => {
    mockGetWallets.mockResolvedValue([MOCK_WALLET_ROW])

    const { result } = renderHook(() => useWallets('u1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_WALLET])
  })

  it('is loading initially', () => {
    mockGetWallets.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useWallets('u1'), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCreateWallet', () => {
  it('calls createWallet and returns mutation', async () => {
    mockCreateWallet.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreateWallet(), { wrapper })

    result.current.mutate({
      userId: 'u1',
      name: 'Zinli',
      currencyId: 'c2',
      type: 'asset',
    })

    await waitFor(() => expect(mockCreateWallet).toHaveBeenCalledTimes(1))
  })
})

describe('useDeactivateWallet', () => {
  it('calls deactivateWallet with id', async () => {
    mockDeactivateWallet.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeactivateWallet(), { wrapper })

    result.current.mutate('w1')

    await waitFor(() => {
      expect(mockDeactivateWallet).toHaveBeenCalledTimes(1)
      expect(mockDeactivateWallet.mock.calls[0][0]).toBe('w1')
    })
  })
})
