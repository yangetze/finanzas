import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { mockGetTransactions, mockCreateTransaction, mockUpdateTransaction, mockDeleteTransaction, mockGetUpcoming, mockBatch } =
  vi.hoisted(() => ({
    mockGetTransactions: vi.fn(),
    mockCreateTransaction: vi.fn(),
    mockUpdateTransaction: vi.fn(),
    mockDeleteTransaction: vi.fn(),
    mockGetUpcoming: vi.fn(),
    mockBatch: vi.fn(),
  }))

vi.mock('@/lib/supabase', () => ({
  getTransactions: mockGetTransactions,
  createTransaction: mockCreateTransaction,
  updateTransaction: mockUpdateTransaction,
  deleteTransaction: mockDeleteTransaction,
  getUpcomingTransactions: mockGetUpcoming,
  createTransactionsBatch: mockBatch,
}))

import {
  useTransactions,
  useUpcomingTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCreateTransactionsBatch,
} from './useTransactions'

const MOCK_ROW = {
  id: 't1',
  user_id: 'u1',
  wallet_id: 'w1',
  envelope_id: 'e1',
  date: '2026-06-15',
  description: 'Netflix',
  status: 'pagado',
  type: 'expense',
  origin_currency_id: 'c1',
  origin_amount: 15,
  payment_currency_id: 'c1',
  payment_amount: 15,
  conversion_rate: null,
  base_currency_id: 'c1',
  base_amount: 15,
  base_rate: null,
  installment_number: null,
  installment_total: null,
  group_id: null,
  notes: null,
  created_at: '2026-06-01',
  updated_at: '2026-06-01',
}

const MOCK_TX = {
  id: 't1',
  userId: 'u1',
  walletId: 'w1',
  envelopeId: 'e1',
  date: '2026-06-15',
  description: 'Netflix',
  status: 'pagado',
  type: 'expense',
  originCurrencyId: 'c1',
  originAmount: 15,
  paymentCurrencyId: 'c1',
  paymentAmount: 15,
  conversionRate: null,
  baseCurrencyId: 'c1',
  baseAmount: 15,
  baseRate: null,
  installmentNumber: null,
  installmentTotal: null,
  groupId: null,
  notes: null,
  createdAt: '2026-06-01',
  updatedAt: '2026-06-01',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useTransactions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped transactions', async () => {
    mockGetTransactions.mockResolvedValue([MOCK_ROW])
    const { result } = renderHook(() => useTransactions('u1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_TX])
  })

  it('passes month to getTransactions when provided', async () => {
    mockGetTransactions.mockResolvedValue([])
    const { result } = renderHook(() => useTransactions('u1', '2026-06'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetTransactions).toHaveBeenCalledWith('u1', '2026-06')
  })

  it('is disabled when userId is undefined', () => {
    const { result } = renderHook(() => useTransactions(undefined), { wrapper })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useUpcomingTransactions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped upcoming transactions', async () => {
    mockGetUpcoming.mockResolvedValue([MOCK_ROW])
    const { result } = renderHook(() => useUpcomingTransactions('u1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].description).toBe('Netflix')
  })
})

describe('useCreateTransaction', () => {
  it('calls createTransaction', async () => {
    mockCreateTransaction.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCreateTransaction(), { wrapper })
    result.current.mutate({
      userId: 'u1',
      date: '2026-06-15',
      description: 'Netflix',
      type: 'expense',
      status: 'pagado',
      originCurrencyId: 'c1',
      originAmount: 15,
      paymentCurrencyId: 'c1',
      paymentAmount: 15,
      baseCurrencyId: 'c1',
      baseAmount: 15,
    })
    await waitFor(() => expect(mockCreateTransaction).toHaveBeenCalledTimes(1))
  })
})

describe('useUpdateTransaction', () => {
  it('calls updateTransaction', async () => {
    mockUpdateTransaction.mockResolvedValue(undefined)
    const { result } = renderHook(() => useUpdateTransaction(), { wrapper })
    result.current.mutate({ id: 't1', data: { status: 'pagado' } })
    await waitFor(() => expect(mockUpdateTransaction).toHaveBeenCalledWith('t1', { status: 'pagado' }))
  })
})

describe('useDeleteTransaction', () => {
  it('calls deleteTransaction', async () => {
    mockDeleteTransaction.mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteTransaction(), { wrapper })
    result.current.mutate('t1')
    await waitFor(() => {
      expect(mockDeleteTransaction).toHaveBeenCalledTimes(1)
      expect(mockDeleteTransaction.mock.calls[0][0]).toBe('t1')
    })
  })
})

describe('useCreateTransactionsBatch', () => {
  it('calls createTransactionsBatch', async () => {
    mockBatch.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCreateTransactionsBatch(), { wrapper })
    result.current.mutate([])
    await waitFor(() => expect(mockBatch).toHaveBeenCalledTimes(1))
  })
})
