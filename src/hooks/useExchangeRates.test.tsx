import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetExchangeRates, mockUpsertExchangeRate } = vi.hoisted(() => ({
  mockGetExchangeRates: vi.fn(),
  mockUpsertExchangeRate: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getExchangeRates: mockGetExchangeRates,
  upsertExchangeRate: mockUpsertExchangeRate,
}))

import { useExchangeRates, useUpsertExchangeRate } from './useExchangeRates'

const MOCK_ROW = {
  id: 'r1',
  from_currency_id: 'c1',
  to_currency_id: 'c2',
  rate: 55.2,
  rate_date: '2026-06-29',
  source: 'BCV',
  created_at: '2026-06-29T00:00:00Z',
}

const MOCK_RATE = {
  id: 'r1',
  fromCurrencyId: 'c1',
  toCurrencyId: 'c2',
  rate: 55.2,
  rateDate: '2026-06-29',
  source: 'BCV',
  createdAt: '2026-06-29T00:00:00Z',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useExchangeRates', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped rates on success', async () => {
    mockGetExchangeRates.mockResolvedValue([MOCK_ROW])
    const { result } = renderHook(() => useExchangeRates(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_RATE])
  })

  it('is loading initially', () => {
    mockGetExchangeRates.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useExchangeRates(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useUpsertExchangeRate', () => {
  it('calls upsertExchangeRate and returns mutation', async () => {
    mockUpsertExchangeRate.mockResolvedValue(undefined)
    const { result } = renderHook(() => useUpsertExchangeRate(), { wrapper })

    result.current.mutate({
      fromCurrencyId: 'c1',
      toCurrencyId: 'c2',
      rate: 55.2,
      rateDate: '2026-06-29',
      source: 'BCV',
    })

    await waitFor(() => expect(mockUpsertExchangeRate).toHaveBeenCalledTimes(1))
  })
})
