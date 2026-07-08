import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetBudgetItems, mockCreateBudgetItem, mockDeactivateBudgetItem } = vi.hoisted(() => ({
  mockGetBudgetItems: vi.fn(),
  mockCreateBudgetItem: vi.fn(),
  mockDeactivateBudgetItem: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getBudgetItems: mockGetBudgetItems,
  createBudgetItem: mockCreateBudgetItem,
  deactivateBudgetItem: mockDeactivateBudgetItem,
}))

import { useBudgetItems, useCreateBudgetItem, useDeactivateBudgetItem } from './useBudgetItems'

const MOCK_ROW = {
  id: 'b1',
  user_id: 'u1',
  envelope_id: 'e1',
  wallet_id: null,
  name: 'Inter',
  base_amount: 40,
  currency_id: 'c1',
  frequency: 'monthly',
  payment_day: 15,
  start_month: null,
  spending_type: 'supervivencia',
  is_active: true,
  notes: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

const MOCK_ITEM = {
  id: 'b1',
  userId: 'u1',
  envelopeId: 'e1',
  walletId: null,
  name: 'Inter',
  baseAmount: 40,
  currencyId: 'c1',
  frequency: 'monthly',
  itemType: 'fixed',
  paymentDay: 15,
  startMonth: null,
  spendingType: 'supervivencia',
  isActive: true,
  notes: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useBudgetItems', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped items on success', async () => {
    mockGetBudgetItems.mockResolvedValue([MOCK_ROW])
    const { result } = renderHook(() => useBudgetItems('u1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_ITEM])
  })

  it('is loading initially', () => {
    mockGetBudgetItems.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useBudgetItems('u1'), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCreateBudgetItem', () => {
  it('calls createBudgetItem', async () => {
    mockCreateBudgetItem.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCreateBudgetItem(), { wrapper })
    result.current.mutate({
      userId: 'u1',
      envelopeId: 'e1',
      name: 'Inter',
      baseAmount: 40,
      currencyId: 'c1',
      frequency: 'monthly',
      spendingType: 'supervivencia',
    })
    await waitFor(() => expect(mockCreateBudgetItem).toHaveBeenCalledTimes(1))
  })
})

describe('useDeactivateBudgetItem', () => {
  it('calls deactivateBudgetItem with id', async () => {
    mockDeactivateBudgetItem.mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeactivateBudgetItem(), { wrapper })
    result.current.mutate('b1')
    await waitFor(() => {
      expect(mockDeactivateBudgetItem).toHaveBeenCalledTimes(1)
      expect(mockDeactivateBudgetItem.mock.calls[0][0]).toBe('b1')
    })
  })
})
