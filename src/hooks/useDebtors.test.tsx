import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetDebtors, mockCreateDebtor, mockUpdateDebtor, mockDeactivateDebtor } = vi.hoisted(() => ({
  mockGetDebtors: vi.fn(),
  mockCreateDebtor: vi.fn(),
  mockUpdateDebtor: vi.fn(),
  mockDeactivateDebtor: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getDebtors: mockGetDebtors,
  createDebtor: mockCreateDebtor,
  updateDebtor: mockUpdateDebtor,
  deactivateDebtor: mockDeactivateDebtor,
}))

import { useDebtors, useCreateDebtor, useUpdateDebtor, useDeactivateDebtor } from './useDebtors'

const MOCK_DEBTOR_ROW = {
  id: 'd1',
  user_id: 'u1',
  name: 'María',
  notes: null,
  is_active: true,
  created_at: '2026-08-01',
  updated_at: '2026-08-01',
}

const MOCK_DEBTOR = {
  id: 'd1',
  userId: 'u1',
  name: 'María',
  notes: null,
  isActive: true,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useDebtors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns debtor list after fetch', async () => {
    mockGetDebtors.mockResolvedValue([MOCK_DEBTOR_ROW])

    const { result } = renderHook(() => useDebtors('u1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_DEBTOR])
  })

  it('is disabled without a userId', () => {
    const { result } = renderHook(() => useDebtors(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateDebtor', () => {
  it('calls createDebtor', async () => {
    mockCreateDebtor.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreateDebtor(), { wrapper })
    result.current.mutate({ userId: 'u1', name: 'Juan' })

    await waitFor(() => expect(mockCreateDebtor).toHaveBeenCalledTimes(1))
  })
})

describe('useUpdateDebtor', () => {
  it('calls updateDebtor with id and data', async () => {
    mockUpdateDebtor.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdateDebtor(), { wrapper })
    result.current.mutate({ id: 'd1', data: { name: 'María G.' } })

    await waitFor(() => {
      expect(mockUpdateDebtor).toHaveBeenCalledTimes(1)
      expect(mockUpdateDebtor).toHaveBeenCalledWith('d1', { name: 'María G.' })
    })
  })
})

describe('useDeactivateDebtor', () => {
  it('calls deactivateDebtor with id', async () => {
    mockDeactivateDebtor.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeactivateDebtor(), { wrapper })
    result.current.mutate('d1')

    await waitFor(() => {
      expect(mockDeactivateDebtor).toHaveBeenCalledTimes(1)
      expect(mockDeactivateDebtor.mock.calls[0][0]).toBe('d1')
    })
  })
})
