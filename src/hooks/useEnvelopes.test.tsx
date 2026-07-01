import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetEnvelopes, mockCreateEnvelope, mockUpdateEnvelope, mockDeactivateEnvelope } = vi.hoisted(() => ({
  mockGetEnvelopes: vi.fn(),
  mockCreateEnvelope: vi.fn(),
  mockUpdateEnvelope: vi.fn(),
  mockDeactivateEnvelope: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getEnvelopes: mockGetEnvelopes,
  createEnvelope: mockCreateEnvelope,
  updateEnvelope: mockUpdateEnvelope,
  deactivateEnvelope: mockDeactivateEnvelope,
}))

import { useEnvelopes, useCreateEnvelope, useDeactivateEnvelope } from './useEnvelopes'

const MOCK_ROW = {
  id: 'e1',
  user_id: 'u1',
  parent_id: null,
  name: 'Hogar',
  category: 'Hogar',
  priority: 'critico',
  spend_category: null,
  emoji: '🏠',
  is_active: true,
  sort_order: 1,
  notes: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

const MOCK_ENVELOPE = {
  id: 'e1',
  userId: 'u1',
  parentId: null,
  name: 'Hogar',
  category: 'Hogar',
  priority: 'critico',
  spendCategory: null,
  emoji: '🏠',
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

describe('useEnvelopes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped envelopes on success', async () => {
    mockGetEnvelopes.mockResolvedValue([MOCK_ROW])
    const { result } = renderHook(() => useEnvelopes('u1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_ENVELOPE])
  })

  it('is loading initially', () => {
    mockGetEnvelopes.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useEnvelopes('u1'), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCreateEnvelope', () => {
  it('calls createEnvelope', async () => {
    mockCreateEnvelope.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCreateEnvelope(), { wrapper })
    result.current.mutate({ userId: 'u1', name: 'Hogar', category: 'Hogar', priority: 'critico' })
    await waitFor(() => expect(mockCreateEnvelope).toHaveBeenCalledTimes(1))
  })
})

describe('useDeactivateEnvelope', () => {
  it('calls deactivateEnvelope with id', async () => {
    mockDeactivateEnvelope.mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeactivateEnvelope(), { wrapper })
    result.current.mutate('e1')
    await waitFor(() => {
      expect(mockDeactivateEnvelope).toHaveBeenCalledTimes(1)
      expect(mockDeactivateEnvelope.mock.calls[0][0]).toBe('e1')
    })
  })
})
