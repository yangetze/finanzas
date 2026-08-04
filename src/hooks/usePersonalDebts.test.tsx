import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const {
  mockGetPersonalDebts,
  mockCreatePersonalDebt,
  mockUpdatePersonalDebt,
  mockDeletePersonalDebt,
} = vi.hoisted(() => ({
  mockGetPersonalDebts: vi.fn(),
  mockCreatePersonalDebt: vi.fn(),
  mockUpdatePersonalDebt: vi.fn(),
  mockDeletePersonalDebt: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getPersonalDebts: mockGetPersonalDebts,
  createPersonalDebt: mockCreatePersonalDebt,
  updatePersonalDebt: mockUpdatePersonalDebt,
  deletePersonalDebt: mockDeletePersonalDebt,
}))

import {
  usePersonalDebts,
  useCreatePersonalDebt,
  useUpdatePersonalDebt,
  useDeletePersonalDebt,
} from './usePersonalDebts'

const MOCK_DEBT_ROW = {
  id: 'pd1',
  user_id: 'u1',
  debtor_id: 'd1',
  direction: 'i_owe_them',
  description: 'Cena del viernes',
  currency_id: 'usd',
  original_amount: 5,
  date: '2026-08-01',
  status: 'open',
  notes: null,
  created_at: '2026-08-01',
  updated_at: '2026-08-01',
}

const MOCK_DEBT = {
  id: 'pd1',
  userId: 'u1',
  debtorId: 'd1',
  direction: 'i_owe_them',
  description: 'Cena del viernes',
  currencyId: 'usd',
  originalAmount: 5,
  date: '2026-08-01',
  status: 'open',
  notes: null,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('usePersonalDebts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns personal debt list after fetch', async () => {
    mockGetPersonalDebts.mockResolvedValue([MOCK_DEBT_ROW])

    const { result } = renderHook(() => usePersonalDebts('u1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_DEBT])
  })

  it('passes debtorId through to getPersonalDebts', async () => {
    mockGetPersonalDebts.mockResolvedValue([])

    renderHook(() => usePersonalDebts('u1', 'd1'), { wrapper })

    await waitFor(() => expect(mockGetPersonalDebts).toHaveBeenCalledWith('u1', 'd1'))
  })

  it('is disabled without a userId', () => {
    const { result } = renderHook(() => usePersonalDebts(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreatePersonalDebt', () => {
  it('calls createPersonalDebt', async () => {
    mockCreatePersonalDebt.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreatePersonalDebt(), { wrapper })
    result.current.mutate({
      userId: 'u1',
      debtorId: 'd1',
      direction: 'i_owe_them',
      description: 'Cena',
      currencyId: 'usd',
      originalAmount: 5,
      date: '2026-08-01',
    })

    await waitFor(() => expect(mockCreatePersonalDebt).toHaveBeenCalledTimes(1))
  })
})

describe('useUpdatePersonalDebt', () => {
  it('calls updatePersonalDebt with id and data', async () => {
    mockUpdatePersonalDebt.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdatePersonalDebt(), { wrapper })
    result.current.mutate({ id: 'pd1', data: { description: 'Cena actualizada' } })

    await waitFor(() => {
      expect(mockUpdatePersonalDebt).toHaveBeenCalledWith('pd1', { description: 'Cena actualizada' })
    })
  })
})

describe('useDeletePersonalDebt', () => {
  it('calls deletePersonalDebt with id', async () => {
    mockDeletePersonalDebt.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeletePersonalDebt(), { wrapper })
    result.current.mutate('pd1')

    await waitFor(() => {
      expect(mockDeletePersonalDebt).toHaveBeenCalledTimes(1)
      expect(mockDeletePersonalDebt.mock.calls[0][0]).toBe('pd1')
    })
  })
})
