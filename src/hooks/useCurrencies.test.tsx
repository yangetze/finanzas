import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetCurrencies } = vi.hoisted(() => ({ mockGetCurrencies: vi.fn() }))
vi.mock('@/lib/supabase', () => ({ getCurrencies: mockGetCurrencies }))

import { useCurrencies } from './useCurrencies'

const MOCK_ROW = {
  id: 'c1',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  type: 'fiat',
  is_active: true,
  sort_order: 1,
  created_at: '2026-01-01',
}

const MOCK_CURRENCY = {
  id: 'c1',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  type: 'fiat',
  isActive: true,
  sortOrder: 1,
  createdAt: '2026-01-01',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useCurrencies', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped currencies on success', async () => {
    mockGetCurrencies.mockResolvedValue([MOCK_ROW])
    const { result } = renderHook(() => useCurrencies(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_CURRENCY])
  })

  it('is loading initially', () => {
    mockGetCurrencies.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useCurrencies(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})
